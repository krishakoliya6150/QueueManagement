import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/queues", label: "Queues" },
  { to: "/analytics", label: "Analytics" },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        Queue<span>Sense</span>
      </div>
      <nav className="sidebar__nav">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__link${isActive ? " sidebar__link--active" : ""}`
            }
            end={to === "/dashboard"}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
