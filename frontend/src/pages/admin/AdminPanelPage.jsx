import { useTranslation } from 'react-i18next';

const AdminPanelPage = () => {
    const { t } = useTranslation();

    return (
        <section>
            <h1 className="text-3xl font-heading text-primary">{t('admin panel')}</h1>
            <p>admin user management and settings are under implementation.</p>
        </section>
    );
};

export default AdminPanelPage;
