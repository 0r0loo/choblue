import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable, type ColumnDef } from "@choblue/ui/data-table";

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const sampleUsers: User[] = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  name: `사용자 ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ["점주", "직원", "관리자"][i % 3]!,
  status: ["활성", "비활성", "대기"][i % 3]!,
}));

const columns: ColumnDef<User, unknown>[] = [
  { accessorKey: "id", header: "ID", enableSorting: true },
  { accessorKey: "name", header: "이름", enableSorting: true },
  { accessorKey: "email", header: "이메일", enableSorting: true },
  { accessorKey: "role", header: "역할", enableSorting: false },
  { accessorKey: "status", header: "상태", enableSorting: false },
];

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "UI/DataTable",
  component: DataTable,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    loading: { control: "boolean" },
    pagination: { control: "boolean" },
    pageSize: { control: "number" },
    emptyMessage: { control: "text" },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => <DataTable columns={columns} data={sampleUsers.slice(0, 5)} />,
};

export const WithPagination: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={sampleUsers}
      pagination
      pageSize={10}
    />
  ),
};

export const CustomPageSize: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={sampleUsers}
      pagination
      pageSize={5}
      pageSizeOptions={[5, 10, 20]}
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={sampleUsers.slice(0, 5)}
      loading
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      emptyMessage="등록된 사용자가 없습니다"
    />
  ),
};

export const EmptyWithPagination: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      pagination
      emptyMessage="검색 결과가 없습니다"
    />
  ),
};

export const CustomCellRenderer: Story = {
  render: () => {
    const customColumns: ColumnDef<User, unknown>[] = [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "이름" },
      { accessorKey: "email", header: "이메일" },
      {
        accessorKey: "role",
        header: "역할",
        cell: ({ getValue }) => (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "상태",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const color =
            status === "활성"
              ? "bg-success-100 text-success-700"
              : status === "대기"
                ? "bg-warning-100 text-warning-700"
                : "bg-danger-100 text-danger-700";
          return (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
              {status}
            </span>
          );
        },
      },
    ];

    return (
      <DataTable
        columns={customColumns}
        data={sampleUsers.slice(0, 8)}
        pagination
        pageSize={5}
      />
    );
  },
};

export const AsyncLoading: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<User[]>([]);

    const handleLoad = () => {
      setLoading(true);
      setData([]);
      setTimeout(() => {
        setData(sampleUsers.slice(0, 10));
        setLoading(false);
      }, 1500);
    };

    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={handleLoad}
          className="w-fit rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          데이터 불러오기
        </button>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination
          pageSize={5}
          emptyMessage="데이터를 불러와주세요"
        />
      </div>
    );
  },
};