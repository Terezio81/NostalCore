
import {
  Gamepad2,
  Heart,
  Trophy,
  House,
  Library,
  Settings,
} from "lucide-react";

import Logo from "../../assets/logo/logo-icon.svg";

import { NavLink } from "react-router-dom";

import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="brand">

    <img
        src={Logo}
        alt="NostalCore Logo"
        className="brand-logo"
    />

    <div>

        <h1>NostalCore</h1>

        <p>

            Não viva no passado.
            Aproveite-o.

        </p>

    </div>

</div>
      </div>

      <nav>
        <NavLink to="/" end>
          <House size={22} />
          <span>Início</span>
        </NavLink>

        <NavLink to="/biblioteca">
          <Library size={22} />
          <span>Biblioteca</span>
        </NavLink>

        <NavLink to="/consoles">
          <Gamepad2 size={22} />
          <span>Consoles</span>
        </NavLink>

        <NavLink to="/favoritos">
          <Heart size={22} />
          <span>Favoritos</span>
        </NavLink>

        <NavLink
        to="/conquistas"
        className={({ isActive }) =>
        isActive
        ? "sidebar-link sidebar-link--active"
        : "sidebar-link"
        }
        >
        <Trophy size={20} />

        <span>Conquistas</span>
        </NavLink>

        <NavLink to="/configuracoes">
          <Settings size={22} />
          <span>Configurações</span>
        </NavLink>
        <footer className="sidebar-footer">

    v0.0.5 Alpha

</footer>
      </nav>
    </aside>
  );
}