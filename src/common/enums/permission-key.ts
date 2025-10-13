export enum PermissionKey {
    // 🏬 Store Permissions
    ApproveRejectStore = "approve_reject_store",
    SuspendStore = "suspend_store",
    commissionStore = "comission_store",
    CreateStore = "create_store",
    UpdateStore = "update_store",
    DeleteStore = "delete_store",
    ViewStores = "view_stores",

    CreateStoreCategory = "create_store_category",
    UpdateStoreCategory = "update_store_category",
    ViewStoreCategory = "view_store_category",

    UpdateOwner = "update_owner",
    ViewOwners = "view_owners",

    UpdateOrderStatus = "update_order_status",
    ViewOrders = "view_orders",

    CreateOffer = "create_offer",
    UpdateOffer = "update_offer",
    ActivateOffer = "activate_offer",

    ViewStoreTransactions = "view_store_transactions",
    SettlementStore = "settlement_store",
    ViewStoreReviews = "view_store_reviews",
    ViewStoreStats = "view_store_stats",

    CreateProduct = "create_product",
    UpdateProduct = "update_product",
    ActivateProduct = "activate_product",

    // 👤 Customer Permissions
    UpdateCustomer = "update_customer",
    DeleteCustomer = "delete_customer",
    ViewCustomerSaves = "view_customer_saves",
    ViewCustomerOrders = "view_customer_orders",
    UpdateCustomerOrder = "update_customer_order",
    AddToCustomerWallet = "add_to_customer_wallet",
    ViewCustomerLogs = "view_customer_logs",
    ViewCustomerTransactions = "view_customer_transitions",
    ViewCustomerPointsHistory = "view_customer_points_history",
    ViewCustomerGifts = "view_customer_gifts",

    // car brands
    CreateCarBrand = "create_car_brand",
    UpdateCarBrand = "update_car_brand",
    ViewCarBrand = "view_car_brand",

    // Avatar
    CreateAvatar = "create_avatar",
    UpdateAvatar = "update_avatar",
    ViewAvatar = "view_avatar",

    // Types Of Store
    CreateTypeOfStore = "create_type_of_store",
    UpdateTypeOfStore = "update_type_of_store",
    ViewTypeOfStore = "view_type_of_store",

    // Subtypes Of Store
    CreateSubtypeOfStore = "create_subtype_of_store",
    UpdateSubtypeOfStore = "update_subtype_of_store",
    ViewSubtypeOfStore = "view_subtype_of_store",

    // Sectors
    CreateSector = "create_sector",
    UpdateSector = "update_sector",
    ViewSector = "view_sector",

    // gift category
    CreateGiftCategory = "create_gift_category",
    UpdateGiftCategory = "update_gift_category",
    ViewGiftCategory = "view_gift_category",

    // gift template
    CreateGiftTemplate = "create_gift_template",
    UpdateGiftTemplate = "update_gift_template",
    ViewGiftTemplate = "view_gift_template",

    // Variant category
    CreateVariantCategory = "create_Variant_category",
    UpdateVariantCategory = "update_Variant_category",
    ViewVariantCategory = "view_Variant_category",

    // Loyalty Offers
    CreateLoyaltyOffer = "create_loyalty_offer",
    UpdateLoyaltyOffer = "update_loyalty_offer",
    ViewLoyaltyOffer = "view_loyalty_offer",

    // ⚙ System Permissions
    SystemPoints = "system_points",
    SystemSettings = "system_settings",

    // Coupons
    CreateCoupon = "create_coupon",
    UpdateCoupon = "update_coupon",
    ViewCoupon = "view_coupon",
}