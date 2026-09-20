# 📖 FurEver PawCare - Data Dictionary

This document serves as the official **Data Dictionary** for the **FurEver PawCare** database schema. It describes the structure, types, constraints, and relationships of all database tables (mapped from the Prisma models to the PostgreSQL physical schema).

---

## 🗂️ Database Tables Overview

The system schema is organized into distinct logical domains:

### 1. Identity & Profile Domain
*   [`users`](#1-users-table) — User accounts for clients, administrators, and veterinarians.
*   [`admin_staff`](#2-admin_staff-table) — Extended profiles for admin and super admin staff.

### 2. Clinical & Telehealth Domain
*   [`pets`](#3-pets-table) — Registered pets owned by users.
*   [`pet_monitoring`](#4-pet_monitoring-table) — Health and symptom monitoring records for pets.
*   [`telemedicine`](#5-telemedicine-table) — Scheduled virtual vet consultations.
*   [`appointments`](#6-appointments-table) — Scheduled clinic appointments (in-person/telemed).

### 3. E-Commerce Domain
*   [`products`](#7-products-table) — Items sold in the online store.
*   [`cart`](#8-cart-table) — Active user shopping carts.
*   [`cart_items`](#9-cart_items-table) — Products currently added to a user's cart.
*   [`orders`](#10-orders-table) — Placed orders for shop items.
*   [`order_items`](#11-order_items-table) — Products associated with completed/placed orders.

### 4. Financial & Billing Domain
*   [`payments`](#12-payments-table) — Transactions linked to orders, appointments, or consultations.

### 5. Engagement & Communication Domain
*   [`announcements`](#13-announcements-table) — Portal broadcast bulletins created by admins.
*   [`announcement_reactions`](#14-announcement_reactions-table) — Reactions (likes/hearts) on portal announcements.
*   [`pet_tutorials`](#15-pet_tutorials-table) — Educational video tutorials created by admins.
*   [`sms_notifications`](#16-sms_notifications-table) — Log of SMS alerts sent to users.
*   [`feedback`](#17-feedback-table) — Portal user ratings and comments.
*   [`notifications`](#18-notifications-table) — In-app notification messages.
*   [`categories`](#19-categories-table) — Product categories.

---

## 📋 Entity Specifications

---

### 1. `users` Table
Stores user credentials, contact details, roles, and security/preferences state.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique identifier for the user account. |
| `full_name` | `String` | `VARCHAR` | - | - | Full legal name of the user. |
| `email` | `String` | `VARCHAR` | **UK** | - | Unique login email address. |
| `password` | `String` | `VARCHAR` | - | - | Salted and hashed password. |
| `phone_number` | `String?` | `VARCHAR` | - | `NULL` | Primary phone contact number (optional). |
| `address` | `String?` | `TEXT` | - | `NULL` | Billing/delivery street address (optional). |
| `role` | `Role` | `ENUM` | - | `'USER'` | User system privileges level. Values: `USER`, `ADMIN`, `SUPER_ADMIN`. |
| `profile_image` | `String?` | `VARCHAR` | - | `NULL` | URL/Path to user avatar image (optional). |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Timestamp when user registered. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Auto-updated timestamp of last profile change. |
| `status` | `UserStatus` | `ENUM` | - | `'ACTIVE'` | Account activation state. Values: `ACTIVE`, `INACTIVE`. |
| `recovery_phone`| `String?` | `VARCHAR` | - | `NULL` | Secondary phone used for recovery (optional). |
| `language` | `String` | `VARCHAR` | - | `'en'` | User language preference locale (e.g., `'en'`, `'es'`). |
| `reset_code` | `String?` | `VARCHAR` | - | `NULL` | Temporary password reset code (optional). |
| `reset_code_expiry`| `DateTime?`| `TIMESTAMPTZ` | - | `NULL` | Expiration timestamp of the password reset code. |

---

### 2. `admin_staff` Table
Holds extended administrative/employment details linked one-to-one with a primary user account.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `String` | `UUID` | **PK, FK** | - | References `users.user_id`. One-to-One mapping. |
| `employee_code` | `String` | `VARCHAR` | **UK** | - | Unique corporate staff registration identifier. |
| `position` | `String` | `VARCHAR` | - | - | Work role position (e.g., `'Lead Veterinarian'`, `'Clerk'`). |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Timestamp when staff profile was initialized. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Timestamp of last staff info edit. |

---

### 3. `pets` Table
Stores details of registered pets linked to their owner's user account.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `pet_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique pet record ID. |
| `user_id` | `String` | `UUID` | **FK** | - | References `users.user_id` (pet owner). |
| `pet_name` | `String` | `VARCHAR` | - | - | Given name of the pet. |
| `breed` | `String?` | `VARCHAR` | - | `NULL` | Breed of the pet (optional). |
| `age` | `Int?` | `INTEGER` | - | `NULL` | Age in years (optional). |
| `gender` | `String?` | `VARCHAR` | - | `NULL` | Gender of the pet (optional). |
| `weight` | `Float?` | `DOUBLE PRECISION`| - | `NULL` | Weight of the pet in kg (optional). |
| `medical_history`| `String?` | `TEXT` | - | `NULL` | Summary of clinical treatments (optional). |
| `vaccination_record`| `String?`| `TEXT` | - | `NULL` | Log of administered vaccines (optional). |
| `avatar` | `String?` | `VARCHAR` | - | `NULL` | URL/Path to pet photo avatar (optional). |
| `species` | `String?` | `VARCHAR` | - | `NULL` | Pet species (e.g., `'Dog'`, `'Cat'`) (optional). |
| `color` | `String?` | `VARCHAR` | - | `NULL` | Primary coat/hair color (optional). |
| `past_illness` | `String?` | `TEXT` | - | `NULL` | Historical medical ailments (optional). |
| `previous_surgeries`| `String?`| `TEXT` | - | `NULL` | Past operational procedures (optional). |
| `veterinarian` | `String?` | `VARCHAR` | - | `NULL` | Default clinic doctor assigned to the pet. |
| `is_archived` | `Boolean` | `BOOLEAN` | - | `FALSE` | Toggle state representing if this pet has been soft-archived. |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Timestamp when pet was registered. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Auto-updated timestamp of last data edit. |

---

### 4. `pet_monitoring` Table
Stores continuous medical monitoring details for a pet, including symptoms and diagnostic reports.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `monitor_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique tracking monitor record ID. |
| `pet_id` | `String` | `UUID` | **FK** | - | References `pets.pet_id`. |
| `symptoms` | `String?` | `TEXT` | - | `NULL` | Logged health symptoms (optional). |
| `behavior_changes`| `String?`| `TEXT` | - | `NULL` | Observations of mood/mindset changes (optional). |
| `activity_changes`| `String?`| `TEXT` | - | `NULL` | Energy level changes (optional). |
| `recommendations` | `String?` | `TEXT` | - | `NULL` | Clinical suggestions generated (optional). |
| `monitoring_status`| `MonitoringStatus`| `ENUM` | - | `'ACTIVE'` | Health status tracker. Values: `ACTIVE`, `RESOLVED`, `CRITICAL`. |
| `report_summary` | `String?` | `TEXT` | - | `NULL` | Summary of clinical monitoring assessment (optional). |
| `admin_findings` | `String?` | `TEXT` | - | `NULL` | Diagnostics logged by Admin (optional). |
| `super_admin_findings`| `String?`| `TEXT`| - | `NULL` | Diagnostics logged by Super Admin (optional). |
| `is_forwarded` | `Boolean` | `BOOLEAN` | - | `FALSE` | Flag representing if cases were escalated to vets. |
| `forwarded_at` | `DateTime?`| `TIMESTAMPTZ` | - | `NULL` | Escalation timestamp (optional). |
| `admit_recommended`| `Boolean`| `BOOLEAN` | - | `FALSE` | Clinic admittance advice flag. |
| `admit_accepted` | `Boolean` | `BOOLEAN` | - | `FALSE` | Owner approval flag for pet clinic admission. |
| `chat_messages` | `Json?` | `JSONB` | - | `NULL` | Captured triage chatbot communication data (optional). |
| `chat_category` | `String?` | `VARCHAR` | - | `NULL` | Categorized issue tier (optional). |
| `chat_step` | `String?` | `VARCHAR` | - | `NULL` | Active dialog step inside triage chat flow (optional). |
| `countdown_duration`| `Int?` | `INTEGER` | - | `NULL` | Triage checkout time limit indicator (optional). |
| `details_answer` | `String?` | `TEXT` | - | `NULL` | User elaborations on health issues (optional). |
| `q1_answer` | `String?` | `TEXT` | - | `NULL` | Answer to query step 1 (optional). |
| `q2_answer` | `String?` | `TEXT` | - | `NULL` | Answer to query step 2 (optional). |
| `takeover_mode` | `Boolean` | `BOOLEAN` | - | `FALSE` | Flag indicating if a human vet took over chat control from bot. |
| `waiting_for_vet` | `Boolean` | `BOOLEAN` | - | `FALSE` | Triage queue state waiting for vet pickup. |
| `vet_requested_at`| `DateTime?`| `TIMESTAMPTZ` | - | `NULL` | Time when vet pickup was requested. |
| `timer_started_at`| `DateTime?`| `TIMESTAMPTZ` | - | `NULL` | Time when diagnostic timer was kicked off. |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Monitoring cycle registration time. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Auto-updated timestamp of last data edit. |

---

### 5. `telemedicine` Table
Manages telemedicine consultations booked by users with a specialized veterinarian.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `telemed_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique record ID for virtual session. |
| `user_id` | `String` | `UUID` | **FK** | - | References `users.user_id` (pet owner). |
| `pet_id` | `String` | `UUID` | **FK** | - | References `pets.pet_id`. |
| `veterinarian_id`| `String` | `UUID` | **FK** | - | References `users.user_id` (assigned doctor). |
| `consultation_date`| `DateTime`| `TIMESTAMPTZ` | - | - | Date and time of scheduled session. |
| `meeting_link` | `String?` | `VARCHAR` | - | `NULL` | Online conference hyperlink (optional). |
| `concern` | `String` | `TEXT` | - | - | Summary of issues described by owner. |
| `diagnosis` | `String?` | `TEXT` | - | `NULL` | Formal diagnosis entered by vet (optional). |
| `prescription` | `String?` | `TEXT` | - | `NULL` | Prescribed medications (optional). |
| `status` | `TelemedStatus`| `ENUM` | - | `'SCHEDULED'` | Telemedicine status. Values: `SCHEDULED`, `ONGOING`, `COMPLETED`, `CANCELLED`. |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Timestamp when telehealth slot was requested. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Auto-updated timestamp. |

---

### 6. `appointments` Table
Stores in-person and general clinical appointment details.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `appointment_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique primary key for appointment. |
| `user_id` | `String` | `UUID` | **FK** | - | References `users.user_id` (client). |
| `pet_id` | `String` | `UUID` | **FK** | - | References `pets.pet_id` (subject animal). |
| `assigned_admin_id`| `String?`| `UUID` | **FK** | `NULL` | References `users.user_id` (clerk/vet staff assigned). |
| `appointment_date`| `DateTime`| `DATE` | - | - | Scheduled day of visit. |
| `appointment_time`| `String` | `VARCHAR` | - | - | Allocated slot duration string (e.g., `'10:00 AM'`). |
| `purpose` | `String` | `TEXT` | - | - | Stated goal of medical visit (e.g., `'Annual Vaccination'`). |
| `status` | `AppointmentStatus`| `ENUM` | - | `'PENDING'` | Lifecycle state. Values: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `PAID`, `DECLINED`. |
| `type` | `String` | `VARCHAR` | - | `'inperson'` | Visit channel type (e.g. `'inperson'`, `'telemed'`). |
| `session_code` | `String?` | `VARCHAR` | - | `NULL` | Optional verification session passkey. |
| `is_archived` | `Boolean` | `BOOLEAN` | - | `FALSE` | Toggle state representing if this appointment has been soft-archived. |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Timestamp when requested. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Auto-updated timestamp. |

---

### 7. `products` Table
Lists items available for sale in the online veterinary e-commerce store.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `product_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique product inventory SKU ID. |
| `product_name` | `String` | `VARCHAR` | - | - | Retail catalog item name. |
| `category` | `String` | `VARCHAR` | - | - | Group category (e.g., `'Food'`, `'Medical Equipment'`). |
| `description` | `String?` | `TEXT` | - | `NULL` | Product features summary (optional). |
| `price` | `Float` | `DOUBLE PRECISION`| - | - | Unit retail price. |
| `stock_quantity` | `Int` | `INTEGER` | - | - | Current items available in stock. |
| `expiration_date` | `DateTime?`| `DATE` | - | `NULL` | Batch shelf life expiry date (optional). |
| `product_image` | `String?` | `VARCHAR` | - | `NULL` | URL/Path to product catalog photo (optional). |
| `status` | `ProductStatus`| `ENUM` | - | `'AVAILABLE'` | Availability state. Values: `AVAILABLE`, `OUT_OF_STOCK`, `DISCONTINUED`. |
| `created_by_admin`| `String` | `UUID` | **FK** | - | References `users.user_id` (admin creator). |
| `is_archived` | `Boolean` | `BOOLEAN` | - | `FALSE` | Toggle state representing if this product has been soft-archived. |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Catalog creation timestamp. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Catalog detail update timestamp. |

---

### 8. `cart` Table
Establishes a shopping cart shell unique to each registered client account.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cart_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique cart container ID. |
| `user_id` | `String` | `UUID` | **FK, UK** | - | References `users.user_id` (cart owner). One-to-One. |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Shopping cart creation timestamp. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Auto-updated timestamp. |

---

### 9. `cart_items` Table
Pairs specific products with their quantities inside a shopping cart shell.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cart_item_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique cart item entry identifier. |
| `cart_id` | `String` | `UUID` | **FK** | - | References `cart.cart_id`. |
| `product_id` | `String` | `UUID` | **FK** | - | References `products.product_id`. |
| `quantity` | `Int` | `INTEGER` | - | - | Items count selected. |
| `subtotal` | `Float` | `DOUBLE PRECISION`| - | - | Computed cost (`price * quantity`). |

---

### 10. `orders` Table
Captures billing and delivery details for checkouts of e-commerce carts.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `order_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique order history sheet ID. |
| `user_id` | `String` | `UUID` | **FK** | - | References `users.user_id` (purchasing user). |
| `order_date` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Checkout completion timestamp. |
| `total_amount` | `Float` | `DOUBLE PRECISION`| - | - | Aggregate final payment price sum. |
| `payment_method` | `String` | `VARCHAR` | - | - | Chosen channel (e.g. `'GCash'`, `'Credit Card'`, `'Cash'`). |
| `order_status` | `OrderStatus`| `ENUM` | - | `'PENDING'` | Processing state. Values: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `COMPLETED`. |
| `delivery_address`| `String` | `TEXT` | - | - | Destination address to ship/deliver. |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Order placement entry timestamp. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Auto-updated timestamp of last order update. |

---

### 11. `order_items` Table
Preserves history records of individual items bought inside an order.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `order_item_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique order line entry record. |
| `order_id` | `String` | `UUID` | **FK** | - | References `orders.order_id`. |
| `product_id` | `String` | `UUID` | **FK** | - | References `products.product_id`. |
| `quantity` | `Int` | `INTEGER` | - | - | Purchased count. |
| `subtotal` | `Float` | `DOUBLE PRECISION`| - | - | Total for item line at time of checkout. |

---

### 12. `payments` Table
Main financial log linking general order checkouts, clinics visits, or online triage payments.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `payment_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique financial receipt audit ID. |
| `order_id` | `String?` | `UUID` | **FK** | `NULL` | References `orders.order_id` (optional). |
| `appointment_id` | `String?` | `UUID` | **FK** | `NULL` | References `appointments.appointment_id` (optional). |
| `telemed_id` | `String?` | `UUID` | **FK** | `NULL` | References `telemedicine.telemed_id` (optional). |
| `payment_amount` | `Float` | `DOUBLE PRECISION`| - | - | Paid amount cash value. |
| `payment_status` | `PaymentStatus`| `ENUM` | - | `'PENDING'` | State of transaction clearing. Values: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`. |
| `payment_date` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Timestamp when transaction was cleared. |
| `reference_number`| `String?` | `VARCHAR` | - | `NULL` | Provider reference (optional GCash/Bank Txn ID). |
| `receipt_image` | `String?` | `VARCHAR` | - | `NULL` | Uploaded receipt proof image file path (optional). |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Invoice generation timestamp. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Auto-updated timestamp. |

---

### 13. `announcements` Table
Stores portal bulletins and banners broadcasted by system admins.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `announcement_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique record ID for announcements. |
| `admin_id` | `String` | `UUID` | **FK** | - | References `users.user_id` (origin admin). |
| `title` | `String` | `VARCHAR` | - | - | Headline of announcement. |
| `content` | `String` | `TEXT` | - | - | Rich message details. |
| `status` | `AnnouncementStatus`| `ENUM`| - | `'PUBLISHED'` | Values: `PUBLISHED`, `DRAFT`. |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Time when created. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Time when last updated. |

---

### 14. `announcement_reactions` Table
Tracks user interaction likes/reactions on published portal announcements.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `reaction_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique reaction record ID. |
| `user_id` | `String` | `UUID` | **FK, UK**| - | References `users.user_id`. Composite unique constraint with `announcement_id`. |
| `announcement_id`| `String` | `UUID` | **FK, UK**| - | References `announcements.announcement_id`. Composite unique constraint with `user_id`. |
| `type` | `ReactionType` | `ENUM` | - | - | Type of reaction. Values: `HEART`, `LIKE`. |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Reaction entry timestamp. |

---

### 15. `pet_tutorials` Table
Links educational resources and clips managed by administrative staff for users.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `tutorial_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique record identifier for tutorials. |
| `admin_id` | `String` | `UUID` | **FK** | - | References `users.user_id`. |
| `title` | `String` | `VARCHAR` | - | - | Topic title header. |
| `description` | `String?` | `TEXT` | - | `NULL` | Overview summary (optional). |
| `video_link` | `String` | `VARCHAR` | - | - | URL hyperlink redirect (e.g. YouTube). |
| `category` | `String?` | `VARCHAR` | - | `NULL` | Tag groupings (e.g. `'Training'`) (optional). |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Publication timestamp. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Edit record timestamp. |

---

### 16. `sms_notifications` Table
Audit logs of custom cell text SMS alerts dispatched to clients.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sms_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique primary audit tracker key. |
| `user_id` | `String` | `UUID` | **FK** | - | References `users.user_id` (recipient). |
| `message` | `String` | `TEXT` | - | - | Body copy of sent message. |
| `notification_type`| `String` | `VARCHAR` | - | - | Message categories (e.g. `'Triage Alert'`, `'Appointment Reminder'`). |
| `sent_status` | `SmsStatus` | `ENUM` | - | `'PENDING'` | Dispatch state. Values: `PENDING`, `SENT`, `FAILED`. |
| `sent_at` | `DateTime?`| `TIMESTAMPTZ` | - | `NULL` | Time when cleared by carrier (optional). |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Initial generation timestamp. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Auto-updated timestamp. |

---

### 17. `feedback` Table
Customer rating score cards and text reviews logged for user experiences.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `feedback_id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique feedback key. |
| `user_id` | `String` | `UUID` | **FK** | - | References `users.user_id`. |
| `rating` | `Int` | `INTEGER` | - | - | Rating metric scalar (e.g., scale of 1-5). |
| `comments` | `String?` | `TEXT` | - | `NULL` | Detailed customer feedback review (optional). |
| `submitted_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Timestamp when submitted. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Last modification timestamp. |

---

### 18. `notifications` Table
Stores generic web/in-app notification messages directed to clients.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique notification ID. |
| `user_id` | `String` | `UUID` | **FK** | - | References `users.user_id` (recipient). |
| `title` | `String` | `VARCHAR` | - | - | Short headline title of notification. |
| `message` | `String` | `TEXT` | - | - | Body text content of the notification. |
| `isRead` | `Boolean` | `BOOLEAN` | - | `FALSE` | Flag indicating whether the notification has been read by the user. |
| `createdAt` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Timestamp when the notification was created. |

---

### 19. `categories` Table
Catalog groupings utilized for online store organization.

| Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | `UUID` | **PK** | `uuid_generate_v4()` | Unique category database key. |
| `name` | `String` | `VARCHAR` | - | - | Display title of category. |
| `slug` | `String` | `VARCHAR` | **UK** | - | URL-friendly slug text. |
| `icon` | `String?` | `VARCHAR` | - | `NULL` | Optional asset URL or CSS class string representing icon. |
| `created_at` | `DateTime` | `TIMESTAMPTZ` | - | `NOW()` | Timestamp when created. |
| `updated_at` | `DateTime` | `TIMESTAMPTZ` | - | - | Auto-updated timestamp of last details change. |

---

## 🔀 Database Custom Enums

### `Role`
Defines global authorization role groups.
*   `SUPER_ADMIN`: Oversees clinic setups, escalations, global financials, and administrative staff management.
*   `ADMIN`: Clinic reception, veterinarian consultants, stock/product managers.
*   `USER`: Animal owners, e-commerce shoppers, clinical bookers.

### `UserStatus`
Tracks current activation account states.
*   `ACTIVE`: Fully verified, operational, allowed portal login access.
*   `INACTIVE`: Blocked or suspended account login state.

### `AppointmentStatus`
Specifies clinical check-in stages.
*   `PENDING`: Requested, waiting for frontdesk clerk validation.
*   `CONFIRMED`: Approved clinic reservation slot.
*   `COMPLETED`: Treatment/visit finalized.
*   `CANCELLED`: Denied or revoked reservation.
*   `PAID`: Fees settle.
*   `DECLINED`: Rejected by system admins.

### `TelemedStatus`
Virtual consult tracking.
*   `SCHEDULED`: Prebooked online slot.
*   `ONGOING`: Consultation actively in progress.
*   `COMPLETED`: Final diagnosis/records submitted.
*   `CANCELLED`: Revoked telehealth appointment.

### `MonitoringStatus`
Pet health assessment conditions.
*   `ACTIVE`: Continuous diagnosis cycles ongoing.
*   `RESOLVED`: Symptoms abated; pet declared healthy.
*   `CRITICAL`: High-risk state requiring immediate medical attention.

### `ProductStatus`
Item inventory shelf states.
*   `AVAILABLE`: Active in stock.
*   `OUT_OF_STOCK`: Temporarily exhausted inventory.
*   `DISCONTINUED`: Permantly removed from store catalog.

### `OrderStatus`
Store purchase fulfillment tracker.
*   `PENDING`: Paid, awaiting clerk validation.
*   `PROCESSING`: Package compilation in warehouse.
*   `SHIPPED`: In transit with logistics courier.
*   `DELIVERED`: Package handed over at destination.
*   `CANCELLED`: Revoked/returned order.
*   `COMPLETED`: Verified receipt by buyer.

### `PaymentStatus`
Transaction lifecycle state.
*   `PENDING`: Awaiting bank/e-wallet confirmation clearing.
*   `COMPLETED`: Transaction validated and settled.
*   `FAILED`: Bank clearing issue/declined.
*   `REFUNDED`: Cleared money returned to sender.

### `SmsStatus`
Dispatched communication state.
*   `PENDING`: Staged in broker queue.
*   `SENT`: Message cleared and dispatched to carrier.
*   `FAILED`: Carrier transmission error.

### `AnnouncementStatus`
Portal broadcast draft controls.
*   `PUBLISHED`: Live for dashboard clients.
*   `DRAFT`: Restricted to admin editing view.

### `ReactionType`
Interaction icons allowed.
*   `HEART`: Love reaction.
*   `LIKE`: Thumbs-up reaction.
