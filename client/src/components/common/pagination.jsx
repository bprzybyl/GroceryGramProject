import React from "react";
import _ from "lodash";

const Pagination = (props) => {
  const { recipesCount, pageSize, currentPage, onPageChange } = props;

  const pagesCount = Math.ceil(recipesCount / pageSize);
  if (pagesCount === 1) return null;
  const pages = _.range(1, pagesCount + 1);

  return (
    <nav aria-label="My Recipes pagination">
      <ul className="pagination">
        {pages.map((page) => (
          <li key={page} className={ page === currentPage ? "page-item active" : "page-item"}>
            <div className="page-link"
              onClick={() => onPageChange(page)}>{page}</div>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination;
