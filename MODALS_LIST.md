# List of All Modals in the Project

## 1. ProductModal
- **Location**: `frontend/src/components/admin/product/ProductModal.tsx`
- **Purpose**: Add/Edit/View products
- **Fields**: name, description, category, price, currency, status, discount, images (1-6), metaFeatures, metaInfo, videos
- **Validation**: Has Zod schema validation

## 2. CategoryModal
- **Location**: `frontend/src/components/admin/product/CategoryModal.tsx`
- **Purpose**: Add/Edit/View categories
- **Fields**: name, icon, products count
- **Validation**: Has Zod schema validation (commented out)

## 3. OrderModal
- **Location**: `frontend/src/components/admin/product/OrderModal.tsx`
- **Purpose**: View and update order status
- **Fields**: status (dropdown)
- **Validation**: None currently

## 4. CheckoutModal
- **Location**: `frontend/src/components/ui/modals/CheckoutModal.tsx`
- **Purpose**: Checkout process with address and payment
- **Fields**: Address fields (firstName, lastName, phone, line1, area, city, province, postalCode), payment method
- **Validation**: Basic required field check (uses alert)

## 5. StripeCardForm
- **Location**: `frontend/src/components/ui/modals/StripeCardForm.tsx`
- **Purpose**: Stripe payment form
- **Fields**: Card number, expiry, CVC
- **Validation**: Handled by Stripe

## 6. ImageCropperModal
- **Location**: `frontend/src/components/admin/product/ImageCropperModal.tsx`
- **Purpose**: Crop images before upload
- **Fields**: Image crop area
- **Validation**: None needed

## 7. DeleteModal
- **Location**: `frontend/src/components/admin/product/DeleteModal.tsx`
- **Purpose**: Confirm deletion actions
- **Fields**: None (confirmation only)
- **Validation**: None needed

## 8. DeveloperKeyModal
- **Location**: `frontend/src/components/developer/DeveloperKeyModal.tsx`
- **Purpose**: Developer verification with key
- **Fields**: Developer key input
- **Validation**: Basic check (uses alert)

## 9. WebPagesPage Modal (Inline)
- **Location**: `frontend/src/pages/developer/pages/WebPagesPage.tsx`
- **Purpose**: Add new web page
- **Fields**: title, slug, icon, subInfo, location, enabled
- **Validation**: Basic check (uses alert)

## 10. AdminTabsPage Modal (Inline)
- **Location**: `frontend/src/pages/developer/pages/AdminTabsPage.tsx`
- **Purpose**: Add new admin tab
- **Fields**: label, path, icon, subInfo, enabled
- **Validation**: Basic check (uses alert)

## Summary
- **Total Modals**: 10
- **With Validation**: 2 (ProductModal, CategoryModal - partial)
- **Using Alerts**: 7 modals/pages
- **Need Validation**: 8 modals
- **Need Alert Replacement**: All modals and pages using alerts











