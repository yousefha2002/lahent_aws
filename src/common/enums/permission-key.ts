export enum PermissionKey {
    // 🏬 Store Permissions
    ChangeStoreStatus = "change_store_status",
    CommissionStore = "commission_store",
    CreateStore = "create_store",
    UpdateStore = "update_store",
    DeleteStore = "delete_store",
    ViewStores = "view_stores",

    CreateStoreCategory = "create_store_category",
    UpdateStoreCategory = "update_store_category",
    ViewStoreCategory = "view_store_category",
    DeleteStoreCategory = "delete_store_category",

    UpdateOwner = "update_owner",
    ViewOwners = "view_owners",

    ViewStoreOrders = "view_store_orders",
    UpdateOrder = "update_order",

    CreateOffer = "create_offer",
    UpdateOffer = "update_offer",
    ActivateOffer = "activate_offer",
    ViewOffer = "view_offer",

    ViewStoreTransactions = "view_store_transactions",
    StoreBalanceAction = "store_balance_action",
    ViewStoreReviews = "view_store_reviews",
    ViewStoreStats = "view_store_stats",

    CreateProduct = "create_product",
    UpdateProduct = "update_product",
    ViewProduct = "view_product",

    // 👤 Customer Permissions
    UpdateCustomer = "update_customer",
    DeleteCustomer = "delete_customer",
    ViewCustomerSaves = "view_customer_saves",
    ViewCustomerOrders = "view_customer_orders",
    CustomerBalanceAction = "customer_balance_action",
    ViewCustomerTransactions = "view_customer_transactions",
    ViewCustomerPointsHistory = "view_customer_points_history",
    ViewCustomerGifts = "view_customer_gifts",
    ViewCustomer ='view_customer',

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
    DeleteTypeOfStore = "delete_type_of_store",

    // Sectors
    CreateSector = "create_sector",
    UpdateSector = "update_sector",
    ViewSector = "view_sector",

    // gift category
    CreateGiftCategory = "create_gift_category",
    UpdateGiftCategory = "update_gift_category",
    ViewGiftCategory = "view_gift_category",

    // Variant category
    CreateVariantCategory = "create_variant_category",
    UpdateVariantCategory = "update_variant_category",
    ViewVariantCategory = "view_variant_category",

    // Loyalty Offers
    CreateLoyaltyOffer = "create_loyalty_offer",
    UpdateLoyaltyOffer = "update_loyalty_offer",
    ViewLoyaltyOffer = "view_loyalty_offer",

    // ⚙ System Permissions
    SystemPoints = "system_points",
    SystemSettings = "system_settings",
    LandingPage = "landing_page",

    // Coupons
    CreateCoupon = "create_coupon",
    UpdateCoupon = "update_coupon",
    ViewCoupon = "view_coupon",

    //Admin
    CreateAdmin = "create_admin",
    UpdateAdmin = "update_admin",
    ViewAdmin = "view_admin",

    //Role
    CreateRole = "create_role",
    UpdateRole = "update_role",
    viewRole = "view_role",

    //Deletion
    RestoreCustomer = "restore_customer",
    RestoreOwner = "restore_owner",
    RestoreStore = "restore_store",
    deleteCustomer = "delete_customer",
    deleteOwner = "delete_owner",
    deleteStore = "delete_store"
}