import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader - Consistent page title, description and action area
 * Usage:
 * <PageHeader title="Users" description="Kelola data pengguna" actions={<Button>Tambah</Button>} />
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h1>
        {description ? (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
};

export default PageHeader;
