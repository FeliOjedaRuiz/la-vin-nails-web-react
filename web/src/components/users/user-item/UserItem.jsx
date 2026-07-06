import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthStore";
import Modal from "../../modal/Modal";
import usersService from "../../../services/users";

/**
 * UserItem — card in the admin user list.
 * Shows blocked badge + toggle button when admin.
 * @param {Object} props
 * @param {Object} props.user - User object from API
 * @param {Function} props.onToggleBlock - Callback(userId) after successful toggle
 */
function UserItem({ user, onToggleBlock }) {
  const { user: adminUser } = useContext(AuthContext);
  const [modalState, setModalState] = useState(false);
  const [error, setError] = useState(null);
  const isAdmin = adminUser && adminUser.role === "admin";

  const handleToggleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setError(null);
    setModalState(true);
  };

  const handleConfirm = () => {
    setModalState(false);
    usersService
      .toggleBlock(user.id)
      .then(() => {
        if (onToggleBlock) onToggleBlock(user.id);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.error ||
          (err?.response?.status === 400
            ? "No podés bloquear tu propia cuenta."
            : "Error al cambiar el estado. Intenta de nuevo.");
        setError(msg);
        setModalState(true);
      });
  };

  const handleCancel = () => {
    setModalState(false);
    setError(null);
  };

  const isBlocking = !user.blocked;

  return (
    <>
      <Link
        to={`/users/${user.id}`}
        className="border-2 rounded-lg border-teal-700 p-2 m-2 flex flex-col wl bg-white/50 relative"
      >
        {user.blocked && (
          <span className="absolute top-2 right-2 text-pink-600 bg-pink-100 text-xs font-semibold px-2 py-0.5 rounded">
            Bloqueada
          </span>
        )}
        <p className="text-lg font-bold text-pink-600 pr-16">
          {user.name} {user.surname}
        </p>
        <p>{user.phone}</p>
        <p>{user.email}</p>

        {isAdmin && (
          <button
            onClick={handleToggleClick}
            className={`mt-2 self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm transition-all active:scale-95 ${
              user.blocked
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-pink-700 hover:bg-pink-800"
            }`}
            aria-label={user.blocked ? "Desbloquear usuario" : "Bloquear usuario"}
          >
            {user.blocked ? (
              <svg xmlns="http://www.w3.org/2000/svg" height="12" viewBox="0 0 576 512" className="fill-current" aria-hidden="true">
                <path d="M352 192h-32V128c0-70.7-57.3-128-128-128S64 57.3 64 128v64H32c-17.7 0-32 14.3-32 32v256c0 17.7 14.3 32 32 32h320c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM112 128c0-44.2 35.8-80 80-80s80 35.8 80 80v64H112V128zm240 264c0 4.4-3.6 8-8 8H152c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h192c4.4 0 8 3.6 8 8v16z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" height="12" viewBox="0 0 384 512" className="fill-current" aria-hidden="true">
                <path d="M224 0c-35.3 0-64 28.7-64 64v64H96c-17.7 0-32 14.3-32 32v320c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32H160V64c0-35.3 28.7-64 64-64s64 28.7 64 64v32c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-35.3-28.7-64-64-64z"/>
              </svg>
            )}
            {user.blocked ? "Desbloquear" : "Bloquear"}
          </button>
        )}
      </Link>

      <Modal modalState={modalState}>
        {error && (
          <p className="text-red-600 text-sm mb-3" role="alert">
            {error}
          </p>
        )}
        <p className="text-lg font-semibold text-teal-700 mb-4">
          {isBlocking
            ? `¿Estás seguro de que querés bloquear a ${user.name}? Esta persona no podrá acceder a la app.`
            : `¿Estás seguro de que querés desbloquear a ${user.name}? Esta persona podrá volver a acceder a la app.`}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-teal-700 font-semibold hover:text-teal-900"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-pink-700 text-white rounded hover:bg-pink-800 font-semibold"
          >
            Confirmar
          </button>
        </div>
      </Modal>
    </>
  );
}

export default UserItem;
