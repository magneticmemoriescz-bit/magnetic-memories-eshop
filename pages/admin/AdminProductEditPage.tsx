import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types';
import { PageWrapper } from '../../components/layout/PageWrapper';

const AdminProductEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { products, updateProducts } = useProducts();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Partial<Product> | null>(null);

    useEffect(() => {
        if (id === 'new') {
            setProduct({
                id: '', name: '', price: 0, shortDescription: '', description: '',
                imageUrl: '', gallery: [], requiredPhotos: 1, variants: [],
            });
        } else {
            const existingProduct = products.find(p => p.id === id);
            setProduct(existingProduct || null);
        }
    }, [id, products]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
        setProduct(prev => prev ? { ...prev, [name]: parsedValue } : null);
    };

    const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
        const newVariants = [...(product?.variants || [])];
        newVariants[index] = { ...newVariants[index], [name]: parsedValue };
        setProduct(prev => prev ? { ...prev, variants: newVariants } : null);
    };

    const addVariant = () => {
        const newVariants = [...(product?.variants || []), { id: `new-${Date.now()}`, name: '', photoCount: 1, price: 0, imageUrl: '' }];
        setProduct(prev => prev ? { ...prev, variants: newVariants } : null);
    };
    
    const removeVariant = (index: number) => {
        const newVariants = [...(product?.variants || [])];
        newVariants.splice(index, 1);
        setProduct(prev => prev ? { ...prev, variants: newVariants } : null);
    };
    
    const handleGalleryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const urls = e.target.value.split('\n').filter(url => url.trim() !== '');
        setProduct(prev => prev ? { ...prev, gallery: urls } : null);
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || !product.name) {
            alert("Název produktu je povinný.");
            return;
        }

        if (id === 'new') {
            const newProduct = {
                ...product,
                id: product.name!.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            } as Product;
            updateProducts([...products, newProduct]);
        } else {
            updateProducts(products.map(p => p.id === id ? product as Product : p));
        }
        navigate('/admin');
    };
    
    if (product === null) return <div>Načítání produktu...</div>;

    const AdminInput: React.FC<any> = ({ label, ...props }) => (
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input {...props} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-purple focus:border-brand-purple sm:text-sm" />
      </div>
    );
    
    const AdminTextarea: React.FC<any> = ({ label, ...props }) => (
       <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea {...props} rows={props.rows || 3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-purple focus:border-brand-purple sm:text-sm" />
      </div>
    );

    return (
        <PageWrapper title={id === 'new' ? 'Nový produkt' : 'Upravit produkt'}>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AdminInput label="Název produktu" name="name" value={product.name} onChange={handleChange} required />
                    <AdminInput label="Cena (Kč)" name="price" type="number" value={product.price} onChange={handleChange} required />
                </div>
                
                <AdminInput label="Krátký popisek" name="shortDescription" value={product.shortDescription} onChange={handleChange} required />
                <AdminTextarea label="Dlouhý popisek" name="description" value={product.description} onChange={handleChange} required />
                
                <AdminInput label="URL hlavního obrázku" name="imageUrl" value={product.imageUrl} onChange={handleChange} placeholder="https://imgur.com/your-image.jpg" required />
                <AdminTextarea label="URL obrázků galerie (každý na nový řádek)" name="gallery" value={product.gallery?.join('\n')} onChange={handleGalleryChange} placeholder="https://imgur.com/image1.jpg&#10;https://imgur.com/image2.jpg" />
                
                <AdminInput label="Počet požadovaných fotek od zákazníka" name="requiredPhotos" type="number" value={product.requiredPhotos} onChange={handleChange} required />

                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Varianty produktu</h3>
                    <div className="space-y-4">
                        {product.variants?.map((variant, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-4 border rounded-md relative">
                                <AdminInput label="ID varianty" name="id" value={variant.id} onChange={(e: any) => handleVariantChange(index, e)} required />
                                <AdminInput label="Název varianty" name="name" value={variant.name} onChange={(e: any) => handleVariantChange(index, e)} required />
                                <AdminInput label="Počet fotek" name="photoCount" type="number" value={variant.photoCount} onChange={(e: any) => handleVariantChange(index, e)} required />
                                <AdminInput label="Cena (volitelné)" name="price" type="number" value={variant.price} onChange={(e: any) => handleVariantChange(index, e)} />
                                <AdminInput label="URL obrázku (volitelné)" name="imageUrl" value={variant.imageUrl || ''} onChange={(e: any) => handleVariantChange(index, e)} placeholder="https://imgur.com/variant.jpg"/>
                                <button type="button" onClick={() => removeVariant(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
                            </div>
                        ))}
                    </div>
                     <button type="button" onClick={addVariant} className="mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Přidat variantu</button>
                </div>

                <div className="flex justify-end gap-4">
                     <Link to="/admin" className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600">Zrušit</Link>
                     <button type="submit" className="bg-brand-purple text-white px-6 py-2 rounded-md hover:opacity-90">Uložit produkt</button>
                </div>
            </form>
        </PageWrapper>
    );
};

export default AdminProductEditPage;
