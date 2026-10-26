import React from "react";

// Shared empty / error state with an optional call to action.
const StateMessage = ({ icon: Icon, title, description, children }) => {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-500">
          <Icon size={28} aria-hidden="true" />
        </div>
      )}
      <h3 className="font-poppins text-xl font-medium text-[#1A202C]">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-md font-inter text-sm text-gray-600">
          {description}
        </p>
      )}
      {children && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
};

export const primaryButtonClass =
  "inline-flex items-center gap-2 rounded-full bg-[#1A202C] px-5 py-2 font-poppins text-sm text-white transition hover:bg-gray-800";

export const secondaryButtonClass =
  "inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2 font-poppins text-sm text-[#1A202C] transition hover:border-[#1A202C]";

export default StateMessage;
