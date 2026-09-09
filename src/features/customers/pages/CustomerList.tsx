import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useCustomers, Customer } from '../api/customersApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import moment from 'moment';
import Container from '../../../components/shared/Container';

const CustomerList = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        full_name: '',
        email: '',
        phone: ''
    });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const { data: customers, isLoading } = useCustomers(0, 100, debouncedFilters);

    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: 'full_name',
            header: 'Customer Name',
            cell: (info) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-neutral-900 dark:text-white">
                        {info.getValue() as string || 'Guest Customer'}
                    </span>
                    <span className="text-xs text-zinc-500">{info.row.original.email || 'No email'}</span>
                </div>
            )
        },
        {
            accessorKey: 'phone',
            header: 'Phone Number',
            cell: (info) => <span className="font-medium text-zinc-700 dark:text-zinc-300">{info.getValue() as string}</span>
        },
        {
            accessorKey: 'created_at',
            header: 'Joined On',
            cell: (info) => (
                <div className="flex flex-col">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {moment(info.getValue() as string).format('MMM DD, YYYY')}
                    </span>
                    <span className="text-[10px] text-zinc-400 italic">
                        {moment(info.getValue() as string).fromNow()}
                    </span>
                </div>
            )
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/customers/${info.row.original.id}`)}
                        className="bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                        <i className="ri-user-search-line mr-1 text-sm" /> View Profile
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Container>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">Customer Management</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">View and analyze your most frequent shoppers and their order history.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-mauve-900 p-4 rounded-lg border border-mauve-200 dark:border-mauve-800 shadow-sm">
                <Input
                    label="Search Name"
                    placeholder="E.g. John Doe"
                    value={filters.full_name}
                    onChange={(e) => setFilters({ ...filters, full_name: e.target.value })}
                    icon="ri-user-line"
                />
                <Input
                    label="Search Email"
                    placeholder="E.g. john@example.com"
                    value={filters.email}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    icon="ri-mail-line"
                />
                <Input
                    label="Search Phone"
                    placeholder="E.g. 9876543210"
                    value={filters.phone}
                    onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                    icon="ri-phone-line"
                />
            </div>

            <div className='border border-mauve-200 dark:border-zinc-700 rounded-lg'>
                <DataTable
                    data={customers || []}
                    columns={columns}
                    isLoading={isLoading}
                />
            </div>
        </Container>
    );
};

export default CustomerList;
