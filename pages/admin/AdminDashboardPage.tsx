
import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../hooks/useAuth';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { formatPrice } from '../../utils/format';
import { downloadHeurekaXml } from '../../utils/heureka';
import { downloadSitemapXml } from '../../utils/sitemap';

const AdminDashboardPage: React.FC = () => {
    const { products, updateProducts, exportProducts, importProducts } = useProducts();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const SITEMAP_URL = 'https://www.magneticmemories.cz/sitemap.xml';

    const handleDelete = (productId: string) => {
        if (window.confirm('Opravdu chcete smazat tento produkt?')) {
            updateProducts(products.filter(p => p.id !== productId));
        }
    };
    
    const handleLogout = () => {
        logout();
        navigate('/');
    }
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await importProducts(file);
                alert("Produkty byly úspěšně naimportovány.");
            } catch (error) {
                alert(`Chyba při importu: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    };

    const handleHeurekaExport = () => downloadHeurekaXml(products);
    const handleSitemapExport = () => downloadSitemapXml(products);

    return (
        <PageWrapper title="Administrace webu">
            <div className="mb-8 space-y-8">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <Link to="/admin/product/new" className="bg-brand-pink text-white px-6 py-2 rounded-md font-bold shadow-sm">
                        + Přidat nový produkt
                    </Link>
                     <button onClick={handleLogout} className="bg-gray-600 text-white px-4 py-2 rounded-md">
                        Odhlásit se
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Heureka */}
                    <div className="bg-white border p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            <span className="bg-orange-500 w-2 h-6 mr-2 inline-block rounded-full"></span>
                            Heureka XML Feed
                        </h3>
                        <button onClick={handleHeurekaExport} className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold">
                            Stáhnout heureka.xml
                        </button>
                    </div>

                    {/* Google Search Console */}
                    <div className="bg-white border p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            <span className="bg-blue-500 w-2 h-6 mr-2 inline-block rounded-full"></span>
                            Google SEO (Sitemap)
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Sitemapu stáhněte a nahrajte do rootu webu (vedle index.html). Pak ji vložte do GSC.
                        </p>
                        <button onClick={handleSitemapExport} className="w-full bg-blue-500 text-white py-2 rounded-lg font-bold">
                            Stáhnout sitemap.xml
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <button onClick={exportProducts} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm border">
                        Exportovat data (JSON)
                    </button>
                    <button onClick={handleImportClick} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm border">
                        Importovat data (JSON)
                    </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
            </div>

            <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produkt</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akce</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatPrice(product.price)} Kč</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/product/${product.id}`} className="text-brand-purple hover:underline">Upravit</Link>
                                    <button onClick={() => handleDelete(product.id)} className="ml-4 text-red-600 hover:underline">Smazat</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PageWrapper>
    );
};

export default AdminDashboardPage;
