import React, { useContext, useState } from "react";
import { AuthContext } from "../../../contexts/AuthStore";
import Modal from "../../modal/Modal";
import usersService from "../../../services/users";
import WhatsappIcon from './../../icons/WhatsappIcon';
import EmailIcon from '../../icons/EmailIcon';

/**
 * UserProfile — shared component for admin profile view and client profile view.
 * @param {Object} props
 * @param {Object} props.user - User object from API
 * @param {Function} [props.onToggleBlock] - Optional callback(userId) for admin to toggle block. When absent, no block controls render.
 */
function UserProfile({ user, onToggleBlock }) {
  const { user: adminUser } = useContext(AuthContext);
  const [modalState, setModalState] = useState(false);
  const [error, setError] = useState(null);
  const isAdmin = adminUser && adminUser.role === "admin";
  const showBlockControls = isAdmin && onToggleBlock;

  const avatarUrl =	user.avatarUrl ||	'https://res.cloudinary.com/duoshgr3h/image/upload/v1736012840/la-vin-nails-web/profile-pictures/avatar-default_wnlpoe.png';

  const handleToggleClick = (e) => {
    e.stopPropagation();
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
      <div className="font-semibold  max-w-[90vw] text-teal-700 overflow-hidden flex flex-col my-4 w-full md:max-w-xl p-6 bg-gradient-to-br from-emerald-100/80 via-white to-pink-50 rounded-2xl shadow-md">
        <div>
          <div className="relative inline-block w-full">
            <img
              src={avatarUrl}
              alt="Foto de perfil"
              className="w-16 h-1w-16 mx-auto rounded-full mb-2"
            />
            {user.blocked && (
              <span className="absolute top-0 right-0 text-pink-600 bg-pink-100 text-xs font-semibold px-2 py-0.5 rounded">
                Bloqueada
              </span>
            )}
          </div>
          <p className="text-center mb-1 text-2xl min-h-8">
            {user.name} {user.surname}
          </p>
        </div>
        <div className=''>
          <a
            href={`https://wa.me/+34${user.phone}?text=¡Hola!`}
            className="flex items-center gap-2 mt-2 h-7"
          >
            <WhatsappIcon color={'#00796b'} />
            <span className="text-xl">{user.phone}</span>
          </a>
          <div className="flex items-center mt-2 h-6">
            <EmailIcon />
            <p className="text-md truncate">{user.email}</p>
          </div>
        </div>

        {showBlockControls && (
          <button
            onClick={handleToggleClick}
            className="mt-4 text-sm text-pink-700 underline hover:text-pink-900 text-left"
          >
            {user.blocked ? "Desbloquear usuario" : "Bloquear usuario"}
          </button>
        )}
      </div>

      {showBlockControls && (
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
      )}
    </>
  );
}

export default UserProfile;
