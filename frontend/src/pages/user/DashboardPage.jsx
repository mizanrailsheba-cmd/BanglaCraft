import { useTranslation } from 'react-i18next';

const DashboardPage = () => {
    const { t } = useTranslation();

    return (
        <section>
            <h1 className="text-3xl font-heading text-primary">{t('dashboard')}</h1>
            <p>{t('my orders')}</p>
            <p>Coming soon...</p>
        </section>
    );
};

export default DashboardPage;
