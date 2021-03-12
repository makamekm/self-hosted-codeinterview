export const CloseDialogButton = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="absolute right-2 top-2 w-6 h-6 text-gray-500 px-1 py-1 rounded-md flex justify-center items-center cursor-pointer hover:bg-gray-500 focus:bg-gray-500 hover:text-gray-100 focus:text-gray-100 transition-colors duration-200"
    >
      <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path
          d="m350.273438 320.105469c8.339843 8.34375 8.339843 21.824219 0 30.167969-4.160157 4.160156-9.621094 6.25-15.085938 6.25-5.460938 0-10.921875-2.089844-15.082031-6.25l-64.105469-64.109376-64.105469 64.109376c-4.160156 4.160156-9.621093 6.25-15.082031 6.25-5.464844 0-10.925781-2.089844-15.085938-6.25-8.339843-8.34375-8.339843-21.824219 0-30.167969l64.109376-64.105469-64.109376-64.105469c-8.339843-8.34375-8.339843-21.824219 0-30.167969 8.34375-8.339843 21.824219-8.339843 30.167969 0l64.105469 64.109376 64.105469-64.109376c8.34375-8.339843 21.824219-8.339843 30.167969 0 8.339843 8.34375 8.339843 21.824219 0 30.167969l-64.109376 64.105469zm0 0"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};
