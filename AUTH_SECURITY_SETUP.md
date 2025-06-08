# Auth Security Settings

## Supabaseダッシュボードでの設定が必要な項目

以下の設定はSupabaseダッシュボードで手動で変更する必要があります：

### 1. OTP Expiry時間の短縮

**現在の問題**: OTP（ワンタイムパスワード）の有効期限が1時間を超えている

**修正方法**:
1. Supabaseダッシュボード → Authentication → Settings
2. "Email" セクションを見つける
3. "OTP Expiry" を **3600秒（1時間）以下** に設定
4. 推奨値: **1800秒（30分）** または **900秒（15分）**

### 2. 漏洩パスワード保護の有効化

**現在の問題**: HaveIBeenPwned.orgを使用した漏洩パスワードチェックが無効

**修正方法**:
1. Supabaseダッシュボード → Authentication → Settings
2. "Password Settings" セクションを見つける
3. "Enable leaked password protection" をチェック
4. これによりHaveIBeenPwned.orgのデータベースと照合してパスワードの安全性をチェック

## セキュリティベストプラクティス

### 推奨設定値:
- **OTP Expiry**: 1800秒（30分）
- **Password Strength**: 最低8文字、大文字・小文字・数字・記号を含む
- **Leaked Password Protection**: 有効
- **Rate Limiting**: デフォルト設定を使用

### その他のセキュリティ対策:
- JWT有効期限の適切な設定
- CAPTCHA保護の検討（必要に応じて）
- メール確認の強制
- パスワードリセット頻度制限

## 設定後の確認

設定変更後、以下を確認してください：
1. Supabaseダッシュボードの"Database Linter"でWarningが消えていること
2. ユーザー登録・ログイン機能が正常に動作すること
3. OTPメールの受信と有効期限が期待通りであること

## 注意事項

これらの設定変更は本番環境に即座に反映されるため、ユーザーへの影響を考慮して実施してください。特にOTP有効期限の短縮は、現在進行中の認証プロセスに影響する可能性があります。