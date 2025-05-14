import { ReactNode } from 'react';
import Navbar from './Navbar';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="container">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
