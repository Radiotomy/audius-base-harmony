import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface MerchItem {
  id: string;
  artist_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category: 'clothing' | 'accessories' | 'vinyl' | 'digital' | 'other';
  images: string[];
  inventory_count: number;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MerchOrder {
  id: string;
  buyer_id: string;
  merch_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: Record<string, any>;
  transaction_hash?: string;
  payment_confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  merch_item?: MerchItem;
}

export interface CreateMerchItemData {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category: 'clothing' | 'accessories' | 'vinyl' | 'digital' | 'other';
  images?: string[];
  inventory_count?: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateMerchItemData extends Partial<CreateMerchItemData> {
  id: string;
}

export const useMerchandise = () => {
  const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
  const [orders, setOrders] = useState<MerchOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMerchItems = async () => {
    if (!user) {
      setMerchItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('merch_items')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMerchItems(data as MerchItem[] || []);
    } catch (error) {
      console.error('Error fetching merchandise:', error);
      toast({
        title: "Error",
        description: "Failed to load merchandise",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('merch_orders')
        .select(`
          *,
          merch_item:merch_items (*)
        `)
        .or(`buyer_id.eq.${user.id},merch_item_id.in.(${merchItems.map(item => item.id).join(',')})`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data as MerchOrder[] || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    }
  };

  const createMerchItem = async (itemData: CreateMerchItemData): Promise<MerchItem | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create merchandise",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('merch_items')
        .insert({
          ...itemData,
          artist_id: user.id,
          currency: itemData.currency || 'ETH',
          inventory_count: itemData.inventory_count || 0,
          is_active: itemData.is_active !== false,
          images: itemData.images || [],
          metadata: itemData.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      setMerchItems(prev => [data as MerchItem, ...prev]);
      
      toast({
        title: "Merchandise Created",
        description: `${itemData.name} has been created successfully`,
      });

      return data as MerchItem;
    } catch (error: any) {
      console.error('Error creating merchandise:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create merchandise",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateMerchItem = async (itemData: UpdateMerchItemData): Promise<MerchItem | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to update merchandise",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { id, ...updateData } = itemData;
      const { data, error } = await supabase
        .from('merch_items')
        .update(updateData)
        .eq('id', id)
        .eq('artist_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setMerchItems(prev => prev.map(item => 
        item.id === id ? data as MerchItem : item
      ));

      toast({
        title: "Merchandise Updated",
        description: `${data.name} has been updated successfully`,
      });

      return data as MerchItem;
    } catch (error: any) {
      console.error('Error updating merchandise:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update merchandise",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteMerchItem = async (itemId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to delete merchandise",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('merch_items')
        .delete()
        .eq('id', itemId)
        .eq('artist_id', user.id);

      if (error) throw error;

      setMerchItems(prev => prev.filter(item => item.id !== itemId));

      toast({
        title: "Merchandise Deleted",
        description: "Merchandise item has been deleted successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting merchandise:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete merchandise",
        variant: "destructive",
      });
      return false;
    }
  };

  const createOrder = async (
    merchItemId: string, 
    quantity: number, 
    shippingAddress?: Record<string, any>
  ): Promise<MerchOrder | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to place orders",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Get the merchandise item to calculate pricing
      const merchItem = merchItems.find(item => item.id === merchItemId);
      if (!merchItem) {
        throw new Error('Merchandise item not found');
      }

      const unitPrice = merchItem.price;
      const totalPrice = unitPrice * quantity;

      const { data, error } = await supabase
        .from('merch_orders')
        .insert({
          buyer_id: user.id,
          merch_item_id: merchItemId,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          currency: merchItem.currency,
          shipping_address: shippingAddress,
        })
        .select()
        .single();

      if (error) throw error;

      // Update inventory count
      await updateMerchItem({
        id: merchItemId,
        inventory_count: Math.max(0, merchItem.inventory_count - quantity),
      });

      toast({
        title: "Order Placed",
        description: `Order for ${merchItem.name} has been placed successfully`,
      });

      return data as MerchOrder;
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateOrderStatus = async (
    orderId: string, 
    status: MerchOrder['status']
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to update orders",
        variant: "destructive",
      });
      return false;
    }

    try {
      const updateData: any = { status };
      
      // Add timestamps based on status
      if (status === 'confirmed') {
        updateData.payment_confirmed_at = new Date().toISOString();
      } else if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('merch_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Refresh orders
      await fetchOrders();

      toast({
        title: "Order Updated",
        description: `Order status updated to ${status}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleMerchActiveStatus = async (itemId: string): Promise<boolean> => {
    const item = merchItems.find(i => i.id === itemId);
    if (!item) return false;

    return updateMerchItem({
      id: itemId,
      is_active: !item.is_active,
    }) !== null;
  };

  useEffect(() => {
    fetchMerchItems();
  }, [user]);

  useEffect(() => {
    if (merchItems.length > 0) {
      fetchOrders();
    }
  }, [merchItems]);

  return {
    merchItems,
    orders,
    loading,
    fetchMerchItems,
    fetchOrders,
    createMerchItem,
    updateMerchItem,
    deleteMerchItem,
    createOrder,
    updateOrderStatus,
    toggleMerchActiveStatus,
  };
};