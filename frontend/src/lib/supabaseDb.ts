import { supabase, getSupabaseConfig } from './supabase';

/**
 * Supabase Database Helper
 * Allows prototype direct reads and writes to Supabase Postgres tables when configured
 */

export const supabaseDb = {
  // Check if Supabase Database is ready
  isReady: () => getSupabaseConfig().isConfigured,

  // Fetch all restaurants from Supabase
  getRestaurants: async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*, categories:menu_categories(*, items:menu_items(*))')
      .order('name');
    if (error) throw error;
    return data;
  },

  // Fetch single restaurant by ID
  getRestaurantById: async (id: string) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*, categories:menu_categories(*, items:menu_items(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Fetch orders for current authenticated user
  getUserOrders: async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Create a new order in Supabase
  createOrder: async (orderPayload: {
    userId: string;
    restaurantId: string;
    items: Array<{ menuItemId: string; name: string; quantity: number; price: number }>;
    totalAmount: number;
    deliveryAddress: string;
    paymentMethod: string;
  }) => {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: orderPayload.userId,
        restaurant_id: orderPayload.restaurantId,
        total_amount: orderPayload.totalAmount,
        delivery_address: orderPayload.deliveryAddress,
        payment_method: orderPayload.paymentMethod,
        status: 'PENDING'
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // Insert order items
    if (orderPayload.items.length > 0) {
      const itemsToInsert = orderPayload.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsErr) throw itemsErr;
    }

    return order;
  }
};
