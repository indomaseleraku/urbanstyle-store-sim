// lib/services/dssService.ts
// Decision Support System (DSS) & Pareto 80/20 ABC Analysis Domain Service

import { orderService } from './orderService';
import { productService } from './productService';

export const dssService = {
  async getDSSAnalytics(period: 'all' | 'today' | '7days' | '30days' = 'all'): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    criticalStockCount: number;
    topProducts: { 
      name: string; 
      sold: number; 
      revenue: number; 
      percentage: number; 
      cumulativePercentage: number;
      abcClass: 'A' | 'B' | 'C';
      actionRecommendation: string;
    }[];
  }> {
    const allOrders = await orderService.getOrders();
    const products = await productService.getProducts('all');

    const now = new Date();
    const orders = allOrders.filter(o => {
      if (period === 'all') return true;
      const orderDate = new Date(o.created_at);
      const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
      if (period === 'today') return diffDays <= 1;
      if (period === '7days') return diffDays <= 7;
      if (period === '30days') return diffDays <= 30;
      return true;
    });

    const paidOrders = orders.filter(o => ['Dibayar', 'Dikemas', 'Dikirim', 'Selesai'].includes(o.status));
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const criticalStockCount = products.filter(p => p.stock <= 5).length;

    // Hitung Produk Terlaris
    const productStats: Record<string, { sold: number; revenue: number }> = {};
    for (const ord of paidOrders) {
      for (const item of ord.items) {
        if (!productStats[item.product_name]) {
          productStats[item.product_name] = { sold: 0, revenue: 0 };
        }
        productStats[item.product_name].sold += item.quantity;
        productStats[item.product_name].revenue += item.subtotal;
      }
    }

    const sortedProducts = Object.entries(productStats)
      .map(([name, data]) => ({
        name,
        sold: data.sold,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Hitung Kumulatif Pareto & Klasifikasi ABC pada seluruh produk terjual
    let runningCumulative = 0;
    const allClassifiedProducts = sortedProducts.map((p) => {
      runningCumulative += p.percentage;
      let abcClass: 'A' | 'B' | 'C' = 'C';
      let actionRecommendation = 'Evaluasi kuota / Kurangi stok pengadaan';

      if (runningCumulative <= 80 || p.percentage >= 25) {
        abcClass = 'A';
        actionRecommendation = 'Prioritas Pengadaan Tinggi (Fast Moving / Wajib Stock Aman)';
      } else if (runningCumulative <= 95) {
        abcClass = 'B';
        actionRecommendation = 'Pengawasan Moderat (Kebutuhan Berkala)';
      }

      return {
        ...p,
        cumulativePercentage: Math.min(100, Number(runningCumulative.toFixed(1))),
        abcClass,
        actionRecommendation,
      };
    });

    const topProducts = allClassifiedProducts.slice(0, 8);

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      criticalStockCount,
      topProducts,
    };
  }
};
