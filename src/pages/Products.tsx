import React from 'react';
import { useProductFilters } from '../hooks/useProductFilters';
import ProductFilterSidebar from '../components/products/ProductFilterSidebar';
import ProductSortHeader from '../components/products/ProductSortHeader';
import ProductGrid from '../components/products/ProductGrid';

export default function Products() {
  const {
    products,
    filteredProducts,
    loading,
    categories,
    brands,
    selectedCategory,
    setSelectedCategory,
    selectedBrands,
    toggleBrand,
    setSelectedBrands,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    onlyDiscounted,
    setOnlyDiscounted,
    onlyInStock,
    setOnlyInStock,
    sortBy,
    setSortBy,
    inPageQuery,
    setInPageQuery,
    mobileFilterOpen,
    setMobileFilterOpen,
    resetAllFilters,
    activeFiltersCount,
    setSearchParams,
    page,
    setPage,
    totalPages,
    totalProducts,
  } = useProductFilters();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title Header */}
        <div className="mb-8 text-right">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
            فروشگاه تجهیزات جانبی
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            بررسی، مقایسه و خرید انواع لوازم جانبی اصلی با گارانتی معتبر
          </p>
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Component */}
          <ProductFilterSidebar
            productsCount={products.length}
            categories={categories}
            brands={brands}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBrands={selectedBrands}
            toggleBrand={toggleBrand}
            setSelectedBrands={setSelectedBrands}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            onlyDiscounted={onlyDiscounted}
            setOnlyDiscounted={setOnlyDiscounted}
            onlyInStock={onlyInStock}
            setOnlyInStock={setOnlyInStock}
            inPageQuery={inPageQuery}
            setInPageQuery={setInPageQuery}
            resetAllFilters={resetAllFilters}
            activeFiltersCount={activeFiltersCount}
            mobileFilterOpen={mobileFilterOpen}
            setMobileFilterOpen={setMobileFilterOpen}
            setSearchParams={setSearchParams}
          />

          {/* Main Product Area */}
          <main className="lg:col-span-9 space-y-6">
            <ProductSortHeader
              filteredCount={totalProducts}
              totalCount={totalProducts}
              sortBy={sortBy}
              setSortBy={setSortBy}
              activeFiltersCount={activeFiltersCount}
              setMobileFilterOpen={setMobileFilterOpen}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              onlyDiscounted={onlyDiscounted}
              setOnlyDiscounted={setOnlyDiscounted}
              onlyInStock={onlyInStock}
              setOnlyInStock={setOnlyInStock}
              inPageQuery={inPageQuery}
              setInPageQuery={setInPageQuery}
            />

            <ProductGrid
              products={filteredProducts}
              loading={loading}
              resetAllFilters={resetAllFilters}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 space-x-reverse mt-8 pb-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  قبلی
                </button>
                <div className="flex space-x-1 space-x-reverse">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        page === i + 1
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-orange-500/50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  بعدی
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
