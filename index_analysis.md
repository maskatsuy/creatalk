# データベースインデックス分析レポート

## 現在設定されているインデックス

### 1. profiles テーブル
- `idx_profiles_email` - profiles(email)

### 2. creators テーブル
- `idx_creators_is_online` - creators(is_online)

### 3. creator_applications テーブル
- `idx_creator_applications_status` - creator_applications(status)
- `idx_creator_applications_user_id` - creator_applications(user_id)
- `idx_creator_applications_follower_count` - creator_applications(follower_count DESC)
- `idx_creator_applications_created_at` - creator_applications(created_at DESC)
- `idx_creator_applications_last_call` - creator_applications(last_call_created_at DESC)

### 4. user_roles テーブル
- `idx_user_roles_user_id` - user_roles(user_id)
- `idx_user_roles_role_id` - user_roles(role_id)

### 5. call_products テーブル
- `idx_call_products_creator_id` - call_products(creator_id)
- `idx_call_products_type` - call_products(type)
- `idx_call_products_status` - call_products(status)
- `idx_call_products_slot_date` - call_products(slot_date)

### 6. call_bookings テーブル
- `idx_call_bookings_product_id` - call_bookings(product_id)
- `idx_call_bookings_user_id` - call_bookings(user_id)
- `idx_call_bookings_creator_id` - call_bookings(creator_id)
- `idx_call_bookings_payment_intent_id` - call_bookings(payment_intent_id)
- `idx_call_bookings_status` - call_bookings(status)
- `idx_call_bookings_room_id` - call_bookings(room_id)

### 7. call_rooms テーブル
- `idx_call_rooms_booking_id` - call_rooms(booking_id)
- `idx_call_rooms_creator_id` - call_rooms(creator_id)
- `idx_call_rooms_status` - call_rooms(status)

### 8. reservations テーブル
- `idx_reservations_start_time` - reservations(start_time)
- `idx_reservations_creator_id` - reservations(creator_id)

### 9. reservation_statuses テーブル
- `idx_reservation_statuses_status` - reservation_statuses(status)

### 10. creator_status テーブル
- `idx_creator_status_creator_plan` - creator_status(creator_id, plan_id)

### 11. queue_participants テーブル
- `idx_queue_participants_plan_status` - queue_participants(plan_id, status)
- `idx_queue_participants_position` - queue_participants(plan_id, position)

### 12. current_queue_calls テーブル
- `idx_current_queue_calls_plan` - current_queue_calls(plan_id)
- `idx_current_queue_calls_status` - current_queue_calls(status)

## 推奨される追加インデックス

### 1. 日付フィールドのインデックス
多くのテーブルで `created_at` や `updated_at` によるソートやフィルタリングが行われる可能性が高いため、以下のインデックスを追加すべきです：

```sql
-- profiles
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- creators
CREATE INDEX idx_creators_created_at ON creators(created_at DESC);

-- call_products
CREATE INDEX idx_call_products_created_at ON call_products(created_at DESC);
CREATE INDEX idx_call_products_updated_at ON call_products(updated_at DESC);

-- call_bookings
CREATE INDEX idx_call_bookings_created_at ON call_bookings(created_at DESC);

-- reservations
CREATE INDEX idx_reservations_created_at ON reservations(created_at DESC);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
```

### 2. 複合インデックス
パフォーマンスを向上させるため、頻繁に一緒に使用されるカラムには複合インデックスを作成すべきです：

```sql
-- call_products: クリエイターのアクティブな商品を検索
CREATE INDEX idx_call_products_creator_status ON call_products(creator_id, status);

-- call_bookings: ユーザーの予約履歴を表示
CREATE INDEX idx_call_bookings_user_status ON call_bookings(user_id, status, created_at DESC);

-- call_bookings: クリエイターの予約管理
CREATE INDEX idx_call_bookings_creator_status ON call_bookings(creator_id, status, created_at DESC);

-- queue_participants: 待機列の管理
CREATE INDEX idx_queue_participants_plan_position_status ON queue_participants(plan_id, position, status);

-- creator_applications: 管理者用の申請管理
CREATE INDEX idx_creator_applications_status_created ON creator_applications(status, created_at DESC);
```

### 3. 外部キーインデックス
外部キー制約があるカラムでインデックスが不足しているもの：

```sql
-- reservations
CREATE INDEX idx_reservations_queue_setting_id ON reservations(queue_setting_id);
CREATE INDEX idx_reservations_fixed_slot_id ON reservations(fixed_slot_id);

-- reservation_statuses
CREATE INDEX idx_reservation_statuses_reservation_id ON reservation_statuses(reservation_id);

-- call_rooms
CREATE INDEX idx_call_rooms_reservation_id ON call_rooms(reservation_id);

-- ratings
CREATE INDEX idx_ratings_reservation_id ON ratings(reservation_id);

-- creator_queue_settings
CREATE INDEX idx_creator_queue_settings_creator_id ON creator_queue_settings(creator_id);

-- creator_fixed_slots
CREATE INDEX idx_creator_fixed_slots_creator_id ON creator_fixed_slots(creator_id);

-- creator_applications
CREATE INDEX idx_creator_applications_reviewed_by ON creator_applications(reviewed_by);

-- current_queue_calls
CREATE INDEX idx_current_queue_calls_creator_id ON current_queue_calls(creator_id);
CREATE INDEX idx_current_queue_calls_participant_id ON current_queue_calls(participant_id);

-- queue_participants
CREATE INDEX idx_queue_participants_user_id ON queue_participants(user_id);
```

### 4. 特定のユースケース用インデックス

```sql
-- アクティブなキューシステムの検索用
CREATE INDEX idx_call_products_type_status_date ON call_products(type, status, slot_date) 
WHERE type = 'queue' AND status = 'active';

-- 進行中の通話を検索
CREATE INDEX idx_call_bookings_status_in_progress ON call_bookings(creator_id, status) 
WHERE status = 'in_progress';

-- オンラインクリエイターの検索
CREATE INDEX idx_creators_online ON creators(is_online) 
WHERE is_online = true;

-- 承認済みクリエイターの検索
CREATE INDEX idx_creator_applications_approved ON creator_applications(user_id, status) 
WHERE status = 'approved';
```

## パフォーマンス改善の優先順位

1. **高優先度**：
   - 外部キーカラムのインデックス（結合の高速化）
   - ステータスと日付の複合インデックス（一般的なクエリパターン）

2. **中優先度**：
   - 日付フィールドの単一インデックス（ソート処理の高速化）
   - 部分インデックス（特定条件のクエリ最適化）

3. **低優先度**：
   - updated_at のインデックス（使用頻度が低い）

## 注意事項

- インデックスの追加は書き込みパフォーマンスに影響を与える可能性があるため、実際の使用パターンを監視しながら段階的に追加することを推奨
- PostgreSQLの `pg_stat_user_indexes` ビューを使用して、インデックスの使用状況を定期的に確認
- 不要なインデックスは削除して、ストレージとメンテナンスコストを削減