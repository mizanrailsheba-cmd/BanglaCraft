import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/" />;
    }

    return children;
}

export default ProtectedRoute;