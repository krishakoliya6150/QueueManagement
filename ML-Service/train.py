import os
import json
from datetime import datetime, timedelta, timezone

import joblib
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient
from sklearn.linear_model import LinearRegression


def _env(name: str, default: str | None = None) -> str | None:
    v = os.getenv(name)
    return v if v is not None and v != "" else default


def build_dataset(db, queue_collection: str, log_collection: str, lookback_days: int) -> pd.DataFrame:
    queues = list(db[queue_collection].find({}, {"_id": 1, "serviceRate": 1}))
    service_rate_by_queue = {str(q["_id"]): float(q.get("serviceRate", 0) or 0) for q in queues}

    since = datetime.now(timezone.utc) - timedelta(days=lookback_days)
    logs = list(
        db[log_collection]
        .find({"timestamp": {"$gte": since}}, {"queueId": 1, "action": 1, "timestamp": 1, "queueLength": 1})
        .sort("timestamp", 1)
    )

    if not logs:
        return pd.DataFrame()

    df = pd.DataFrame(logs)
    df["queueIdStr"] = df["queueId"].astype(str)
    df["serviceRate"] = df["queueIdStr"].map(service_rate_by_queue).fillna(0.0)
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True, errors="coerce")
    df = df.dropna(subset=["timestamp"])
    df["hourOfDay"] = df["timestamp"].dt.hour.astype(int)
    df["currentLength"] = pd.to_numeric(df.get("queueLength"), errors="coerce").fillna(0).astype(float)

    # Rolling activity windows per queue (15m + 30m).
    df = df.sort_values(["queueIdStr", "timestamp"])

    rows = []
    for queue_id, g in df.groupby("queueIdStr", sort=False):
        g = g.reset_index(drop=True)

        # Precompute for each row: counts in last window by scanning with two pointers.
        t = g["timestamp"].tolist()
        action = g["action"].tolist()
        length = g["currentLength"].tolist()
        service_rate = float(g["serviceRate"].iloc[0] or 0.0)

        j15 = l15 = 0
        j30 = l30 = 0
        left15 = 0
        left30 = 0

        for i in range(len(g)):
            now = t[i]
            win15 = now - timedelta(minutes=15)
            win30 = now - timedelta(minutes=30)

            # Move left pointers forward, decrement counts
            while left15 < i and t[left15] < win15:
                if action[left15] == "JOIN":
                    j15 -= 1
                elif action[left15] == "LEAVE":
                    l15 -= 1
                left15 += 1

            while left30 < i and t[left30] < win30:
                if action[left30] == "JOIN":
                    j30 -= 1
                elif action[left30] == "LEAVE":
                    l30 -= 1
                left30 += 1

            # Add current row into windows
            if action[i] == "JOIN":
                j15 += 1
                j30 += 1
            elif action[i] == "LEAVE":
                l15 += 1
                l30 += 1

            activity15 = j15 + l15

            # Proxy effective service rate using recent leaves.
            eff_rate = (l30 / 30.0) if l30 > 0 else service_rate
            eff_rate = max(eff_rate, 0.01)

            target_wait = float(length[i]) / eff_rate

            rows.append(
                {
                    "queueId": queue_id,
                    "currentLength": float(length[i]),
                    "serviceRate": float(service_rate),
                    "hourOfDay": int(g.loc[i, "hourOfDay"]),
                    "activityCount": int(activity15),
                    "recentJoins": int(j15),
                    "recentLeaves": int(l15),
                    "targetWaitTime": float(target_wait),
                }
            )

    out = pd.DataFrame(rows)
    out = out.replace([pd.NA, float("inf"), float("-inf")], 0).fillna(0)
    return out


def main() -> None:
    load_dotenv()

    mongo_uri = _env("MONGODB_URI") or _env("MONGO_URI") or "mongodb://localhost:27017/queuesense"
    db_name = _env("MONGODB_DB") or _env("DB_NAME") or "queuesense"
    queue_collection = _env("QUEUE_COLLECTION") or "queues"
    log_collection = _env("QUEUELOG_COLLECTION") or "queuelogs"
    lookback_days = int(_env("LOOKBACK_DAYS", "30") or "30")

    client = MongoClient(mongo_uri)
    db = client[db_name]

    dataset = build_dataset(db, queue_collection, log_collection, lookback_days)
    os.makedirs("data", exist_ok=True)
    os.makedirs("model", exist_ok=True)

    dataset_path = os.path.join("data", "training.csv")
    dataset.to_csv(dataset_path, index=False)

    feature_cols = [
        "currentLength",
        "serviceRate",
        "hourOfDay",
        "activityCount",
        "recentJoins",
        "recentLeaves",
    ]

    meta = {
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "dbName": db_name,
        "lookbackDays": lookback_days,
        "featureCols": feature_cols,
        "rows": int(len(dataset)),
        "note": "Target is a proxy derived from historical logs (recent leaves => effective service rate).",
    }

    if len(dataset) < 50:
        # Not enough data; store a minimal metadata-only model marker.
        meta["model"] = "fallback"
        with open(os.path.join("model", "meta.json"), "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)
        print(f"Not enough data to train (rows={len(dataset)}). Wrote meta only to model/meta.json.")
        return

    X = dataset[feature_cols].astype(float)
    y = dataset["targetWaitTime"].astype(float)

    model = LinearRegression()
    model.fit(X, y)

    joblib.dump(model, os.path.join("model", "model.joblib"))
    meta["model"] = "LinearRegression"
    meta["coef"] = {c: float(v) for c, v in zip(feature_cols, model.coef_)}
    meta["intercept"] = float(model.intercept_)

    with open(os.path.join("model", "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    print(f"Trained LinearRegression on {len(dataset)} rows.")
    print(f"Saved model/model.joblib and model/meta.json")


if __name__ == "__main__":
    main()

