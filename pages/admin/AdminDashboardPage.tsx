
import React, { useRef, useState } from 'react';
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
    const [copySuccess, setCopySuccess] = useState(false);

    const HEUREKA_FEED_URL = 'https://magneticmemories.cz/heureka.xml';

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

    const copyToClipboard = () => {
        navigator.clipboard.writeText(HEUREKA_FEED_URL);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <PageWrapper title="Administrace produktů">
            <div className="mb-8 space-y-8">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <Link to="/admin/product/new" className="inline-block bg-brand-pink text-white px-6 py-2 rounded-md hover:opacity-90 font-bold shadow-sm">
                        + Přidat nový produkt
                    </Link>
                     <button onClick={handleLogout} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                        Odhlásit se
                    </button>
                </div>

                {/* Sekce Heureka Integrace */}
                <div className="bg-white border-2 border-orange-100 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="bg-orange-500 text-white p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-dark-gray">Heureka.cz Integrace</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Pro registraci na Heurece použijte tuto URL adresu XML feedu:
                        </p>
                        
                        <div className="flex items-center space-x-2">
                            <code className="flex-grow p-3 bg-gray-100 rounded-lg text-brand-purple font-mono text-sm break-all border border-gray-200">
                                {HEUREKA_FEED_URL}
                            </code>
                            <button 
                                onClick={copyToClipboard}
                                className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${copySuccess ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                {copySuccess ? 'Kopírováno!' : 'Kopírovat'}
                            </button>
                        </div>

                        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mt-4">
                            <p className="text-xs text-orange-800 leading-relaxed">
                                <strong>DŮLEŽITÉ:</strong> Tato aplikace je statická. Heureka si soubor nemůže stáhnout přímo z prohlížeče. <br />
                                1. Po každé úpravě produktů klikněte na tlačítko <strong>"Stáhnout XML pro Heureku"</strong>. <br />
                                2. Stažený soubor <code>heureka.xml</code> nahrajte na váš webový hosting (přes FTP) do hlavní složky.
                            </p>
                        </div>

                        <button 
                            onClick={handleHeurekaExport} 
                            className="w-full sm:w-auto bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-bold shadow-md"
                        >
                            Stáhnout XML pro Heureku
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={exportProducts} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                        Exportovat webová data (JSON)
                    </button>
                    <button onClick={handleImportClick} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                        Importovat webová data (JSON)
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
