import json
import os
from datetime import datetime, timezone

import joblib
from flask import Flask, jsonify, request


FEATURES = [
    "currentLength",
    "serviceRate",
    "hourOfDay",
    "activityCount",
    "recentJoins",
    "recentLeaves",
]


def _fallback_wait(payload: dict) -> float:
    try:
        length = float(payload.get("currentLength") or 0)
        rate = float(payload.get("serviceRate") or 0)
        if rate <= 0:
            return 0.0
        return round(length / rate, 2)
    except Exception:
        return 0.0


def load_model():
    model_path = os.path.join("model", "model.joblib")
    meta_path = os.path.join("model", "meta.json")

    model = None
    meta = None

    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
        except Exception:
            meta = None

    if os.path.exists(model_path):
        try:
            model = joblib.load(model_path)
        except Exception:
            model = None

    return model, meta


app = Flask(__name__)
MODEL, META = load_model()


@app.get("/health")
def health():
    return jsonify(
        {
            "ok": True,
            "time": datetime.now(timezone.utc).isoformat(),
            "modelLoaded": MODEL is not None,
            "meta": META,
        }
    )


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}

    # Validate & coerce
    x = []
    for k in FEATURES:
        try:
            x.append(float(payload.get(k) or 0))
        except Exception:
            x.append(0.0)

    if MODEL is None:
        return jsonify({"predictedWaitTime": _fallback_wait(payload), "model": "fallback"}), 200

    try:
        y = float(MODEL.predict([x])[0])
        if not (y >= 0):
            y = _fallback_wait(payload)
        return jsonify({"predictedWaitTime": round(y, 2), "model": META.get("model") if META else "model"}), 200
    except Exception:
        return jsonify({"predictedWaitTime": _fallback_wait(payload), "model": "fallback"}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=bool(os.getenv("DEBUG")))

