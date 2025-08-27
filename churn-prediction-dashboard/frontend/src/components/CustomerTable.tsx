import React, { useEffect, useState } from 'react';
import { Customer } from '../types';
import { fetchCustomers } from '../services/api';

const CustomerTable: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getCustomers = async () => {
            try {
                const data = await fetchCustomers();
                setCustomers(data);
            } catch (err) {
                setError('Failed to fetch customers');
            } finally {
                setLoading(false);
            }
        };

        getCustomers();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Churn Risk</th>
                </tr>
            </thead>
            <tbody>
                {customers.map((customer) => (
                    <tr key={customer.id}>
                        <td>{customer.id}</td>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.churnRisk}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default CustomerTable;