import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../../contexts/AuthStore";
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
  const isAdmin = adminUser && adminUser.role === "admin";

  const handleToggleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setModalState(true);
  };

  const handleConfirm = () => {
    setModalState(false);
    usersService
      .toggleBlock(user.id)
      .then(() => {
        if (onToggleBlock) onToggleBlock(user.id);
      })
      .catch(() => {
        // keep previous state, error handled by caller if needed
      });
  };

  const handleCancel = () => {
    setModalState(false);
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
            className="mt-2 text-sm text-left text-pink-700 underline hover:text-pink-900"
          >
            {user.blocked ? "Desbloquear" : "Bloquear"}
          </button>
        )}
      </Link>

      <Modal modalState={modalState}>
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
