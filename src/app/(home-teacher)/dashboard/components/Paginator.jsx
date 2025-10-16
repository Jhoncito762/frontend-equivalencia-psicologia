import { useState, useEffect } from "react";
import Icon from "@/components/Icon";

const { FaArrowLeft, FaArrowRight } = Icon;

const Paginator = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const [activePage, setActivePage] = useState(currentPage);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    setActivePage(currentPage);
  }, [currentPage]);

  const handlePrevious = () => {
    if (activePage > 1) {
      const newPage = activePage - 1;
      setActivePage(newPage);
      onPageChange(newPage);
    }
  };

  const handleNext = () => {
    if (activePage < totalPages) {
      const newPage = activePage + 1;
      setActivePage(newPage);
      onPageChange(newPage);
    }
  };

  const handlePageClick = (page) => {
    if (page !== "...") {
      setActivePage(page);
      onPageChange(page);
    }
  };

  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (activePage > 3) pages.push("...");
      const start = Math.max(2, activePage - 1);
      const end = Math.min(totalPages - 1, activePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (activePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex justify-between items-center w-full mt-4 text-sm select-none">
      <button
        onClick={handlePrevious}
        disabled={activePage === 1}
        className="flex items-center gap-1 font-semibold text-gray-700 hover:text-blue-500 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
      >
        <FaArrowLeft /> Regresar
      </button>

      <div className="flex items-center gap-2">
        {getPages().map((page, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            disabled={page === "..."}
            className={`px-2.5 py-1.5 rounded-md font-semibold cursor-pointer ${
              page === activePage
                ? "bg-[#8F141B] text-white"
                : "text-gray-800 hover:bg-gray-100"
            } ${page === "..." && "cursor-default text-gray-500"}`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={activePage === totalPages}
        className="flex items-center gap-1 font-semibold text-gray-700 hover:text-blue-500 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
      >
        Siguiente <FaArrowRight />
      </button>
    </div>
  );
};

export default Paginator;
