import React from 'react';
import PropTypes from 'prop-types';
import Avatar from './Avatar';

const AddCollaboratorsModal = ({
  isOpen,
  onClose,
  users,
  selectedUserId,
  handleUserClick,
  addCollaborators,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-w-full p-4 bg-white rounded-md w-96 dark:bg-gray-800">
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('selectUser')}</h2>
          <button onClick={onClose} className="p-2 text-gray-900 dark:text-gray-100">
            <i className="ri-close-fill"></i>
          </button>
        </header>
        <div className="flex flex-col gap-2 mb-16 overflow-auto users-list max-h-96">
          {users.map((u) => (
            <div
              key={u._id}
              className={`user cursor-pointer hover:bg-slate-200 dark:hover:bg-gray-700 ${Array.from(selectedUserId).includes(u._id) ? "bg-slate-200 dark:bg-gray-700" : ""} p-2 flex gap-2 items-center rounded`}
              onClick={() => handleUserClick(u._id)}
            >
              <Avatar firstName={u.firstName} className="w-12 h-12 text-base" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{u.firstName}</h1>
            </div>
          ))}
        </div>
        <button
          onClick={addCollaborators}
          className="absolute px-4 py-2 text-white transform -translate-x-1/2 bg-blue-600 rounded-md hover:bg-blue-700 bottom-4 left-1/2"
        >
          {t('addCollaborators')}
        </button>
      </div>
    </div>
  );
};

AddCollaboratorsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  selectedUserId: PropTypes.object.isRequired,
  handleUserClick: PropTypes.func.isRequired,
  addCollaborators: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default AddCollaboratorsModal;
