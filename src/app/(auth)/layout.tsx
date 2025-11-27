import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * تخطيط (Layout) لمسارات المصادقة (تسجيل الدخول وإنشاء الحساب)
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary/10 dark:bg-dark-bg">
      <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-extrabold text-primary dark:text-secondary hover:text-secondary transition-colors">
                احجزلي
            </h1>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
