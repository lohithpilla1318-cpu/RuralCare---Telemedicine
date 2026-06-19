import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/fetchHelper';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Search, ShoppingCart, Info, Check } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  stock: number;
  dosage: string;
  description: string;
  bilingualLabel: string;
}

export const Medicines: React.FC = () => {
  const { addToCart, cartItems } = useCart();
  const { t } = useLanguage();
  
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await apiFetch('/api/medicines');
        if (res.ok) {
          const data = await res.json();
          setMedicines(data);
        }
      } catch (err) {
        console.error('Failed to load medicines from server:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  const handleAddToCart = (med: Medicine) => {
    addToCart({
      id: med.id,
      name: med.name,
      genericName: med.genericName,
      price: med.price
    });
    
    // Animate successful add
    setAddedItemIds(prev => ({ ...prev, [med.id]: true }));
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [med.id]: false }));
    }, 1500);
  };

  const categories = [
    { name: 'All', key: 'allCategories' },
    { name: 'Fever & Pain Relief', key: 'feverPain' },
    { name: 'Cold & Allergy', key: 'coldAllergy' },
    { name: 'Stomach & Gas', key: 'stomachGas' },
    { name: 'Vitamins & Nutrition', key: 'vitaminsNutrition' },
    { name: 'First Aid & Nutrition', key: 'firstAid' },
    { name: 'Blood Pressure', key: 'bloodPressure' },
    { name: 'Diabetes Care', key: 'diabetesCare' },
  ];

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = 
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.bilingualLabel.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      selectedCategory === 'All' || 
      med.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Search and Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t('navMedicines')}</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Compare prices and buy authentic medicines delivered to your village door / असली जेनेरिक दवाइयां सीधे अपने घर मंगाएं।
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={t('medicineSearchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="overflow-x-auto pb-2 flex gap-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat.name
                ? 'bg-primary border-primary text-primary-foreground shadow-md'
                : 'bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(cat.key)}
          </button>
        ))}
      </div>

      {/* Loading state spinner */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading medicines catalog... / दवाइयां लोड की जा रही हैं...</p>
        </div>
      ) : filteredMedicines.length === 0 ? (
        /* Empty results state */
        <div className="min-h-[30vh] border border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-6 text-center">
          <span className="text-5xl mb-2">🔍</span>
          <p className="font-bold text-sm text-foreground/80">No medicines match your search / कोई दवा नहीं मिली।</p>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Check the spelling or choose a different category. If not available, search using 'Image Search' or consult a doctor.
          </p>
        </div>
      ) : (
        /* Medicines list grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((med) => {
            const isAdded = addedItemIds[med.id];
            const inCart = cartItems.find(item => item.medicineId === med.id);
            
            return (
              <div 
                key={med.id} 
                className="bg-card border border-border rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  {/* Category badge */}
                  <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary font-black rounded-full text-[9px] uppercase">
                    {med.category}
                  </span>

                  <h3 className="font-black text-base text-foreground leading-tight">{med.name}</h3>
                  
                  {/* Local Bilingual Helper */}
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/10">
                    {med.bilingualLabel}
                  </p>

                  <div className="text-xs space-y-1 pt-1">
                    <p className="text-muted-foreground">
                      <strong>{t('genericName')}:</strong> <span className="text-foreground/90 font-medium">{med.genericName}</span>
                    </p>
                    <p className="text-muted-foreground">
                      <strong>{t('dosage')}:</strong> <span className="text-foreground/90 font-medium">{med.dosage}</span>
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground/80 leading-relaxed italic pt-1 line-clamp-2">
                    {med.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block">{t('price')}</span>
                    <span className="text-xl font-black text-foreground">₹{med.price}</span>
                  </div>

                  {med.stock > 0 ? (
                    <button
                      onClick={() => handleAddToCart(med)}
                      disabled={isAdded}
                      className={`px-4 py-2.5 rounded-xl font-black shadow-sm flex items-center gap-1.5 text-xs active:scale-95 transition-all ${
                        isAdded
                          ? 'bg-green-600 text-white shadow-green-200'
                          : 'bg-primary hover:bg-primary/95 text-primary-foreground'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} />
                          <span>{t('added')}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} />
                          <span>{t('addToCart')} {inCart ? `(${inCart.quantity})` : ''}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-destructive px-3 py-1.5 bg-destructive/10 rounded-xl border border-destructive/20">
                      {t('outOfStock')}
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Safety alert footnote */}
      <div className="bg-slate-500/5 border border-border p-4 rounded-3xl flex items-start gap-2.5 text-[10px] text-muted-foreground leading-relaxed mt-4">
        <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <p>
          <strong>Pharmacist Note:</strong> Self-medication is hazardous. Medicines on this portal are listed with standard precautions. Please consult with our digital doctors prior to taking high-potency antibiotics or prescription-regulated cardiovascular drugs.
        </p>
      </div>

    </div>
  );
};
