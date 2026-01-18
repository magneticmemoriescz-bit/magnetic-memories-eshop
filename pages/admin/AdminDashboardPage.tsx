
import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../hooks/useAuth';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { formatPrice } from '../../utils/format';
import { downloadHeurekaXml } from '../../utils/heureka';

const AdminDashboardPage: React.FC = () => {
    const { products, updateProducts, exportProducts, importProducts } = useProducts();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleHeurekaExport = () => {
        downloadHeurekaXml(products);
    };

    return (
        <PageWrapper title="Administrace produktů">
            <div className="mb-8 space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <Link to="/admin/product/new" className="inline-block bg-brand-pink text-white px-6 py-2 rounded-md hover:opacity-90 font-bold shadow-sm">
                        + Přidat nový produkt
                    </Link>
                     <button onClick={handleLogout} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                        Odhlásit se
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={exportProducts} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                        Exportovat webová data (JSON)
                    </button>
                    <button onClick={handleImportClick} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                        Importovat webová data (JSON)
                    </button>
                    <button onClick={handleHeurekaExport} className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium shadow-sm">
                        Exportovat Heureka.xml
                    </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
                
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-xs text-orange-800">
                        <strong>Tip pro Heureku:</strong> Stažený soubor <code>heureka.xml</code> nahrajte přes FTP do hlavního adresáře vašeho webu. Poté bude dostupný na adrese <code>magneticmemories.cz/heureka.xml</code>, kterou vložíte do administrace Heureky.
                    </p>
                </div>
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
                                    <Link to={`/admin/product/${product.id}`} className="text-brand-purple hover:text-brand-pink transition-colors">Upravit</Link>
                                    <button onClick={() => handleDelete(product.id)} className="ml-4 text-red-600 hover:text-red-800 transition-colors">Smazat</button>
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
