import type { MessageCatalog } from './en';

// Vietnamese interface copy. The type requires exactly the English keys.
export const vi: MessageCatalog = {
  common: {
    appName: 'ReflexVocab',
    loading: 'Đang tải…',
    retry: 'Thử lại',
    skipToContent: 'Chuyển đến nội dung chính',
  },
  nav: {
    label: 'Điều hướng chính',
    home: 'ReflexVocab — Hôm nay',
    today: 'Hôm nay',
    learn: 'Lộ trình',
    practice: 'Luyện tập',
    library: 'Kho từ',
    progress: 'Tiến độ',
    settings: 'Cài đặt',
  },
  config: {
    title: 'ReflexVocab chưa được cấu hình',
    missing: 'Thêm URL dự án Supabase và publishable key vào .env.local, sau đó khởi động lại máy chủ phát triển.',
    invalid: 'Cấu hình Supabase không hợp lệ. Hãy dùng URL dự án và khóa sb_publishable_, không bao giờ dùng secret key.',
  },
  signIn: {
    heroLabel: 'Giới thiệu ReflexVocab',
    heroTitle: 'Hiểu từng cụm.\nNhớ thật lâu.',
    heroBody: 'Từ vựng TOEIC học trong ngữ cảnh, ôn lại đúng lúc sắp quên.',
    sampleTopic: 'Meetings',
    sampleProgress: '3/10',
    samplePrompt: 'We need to ___ the workshop until Friday.',
    title: 'Chào bạn trở lại.',
    subtitle: 'Đăng nhập để tiếp tục lộ trình của bạn.',
    tagline: 'Hiểu từng cụm. Nhớ thật lâu.',
    email: 'Email',
    password: 'Mật khẩu',
    submit: 'Bắt đầu học',
    submitting: 'Đang đăng nhập…',
    privateNotice: 'Dành cho tài khoản đã được cấp quyền.',
    errors: {
      required: 'Nhập email và mật khẩu.',
      unauthenticated: 'Email hoặc mật khẩu không đúng.',
      unavailable: 'Không kết nối được dịch vụ đăng nhập. Kiểm tra kết nối mạng rồi thử lại.',
    },
  },
  account: {
    loading: 'Đang tải dữ liệu học của bạn…',
    loadFailed: 'Không tải được dữ liệu học của bạn.',
    loadFailedBody: 'Kiểm tra kết nối mạng rồi thử lại. Chưa có gì bị thay đổi.',
    sessionEnded: 'Phiên đăng nhập đã kết thúc. Hãy đăng nhập lại để tiếp tục.',
  },
  today: {
    title: 'Hôm nay',
    subtitle: 'Ôn lại từ đã học và tiếp tục với những chủ đề của bạn.',
  },
  settings: {
    title: 'Cài đặt',
    subtitle: 'Điều chỉnh vừa đủ để mỗi phiên học dễ bắt đầu hơn.',
    account: {
      title: 'Tài khoản',
      body: 'Bạn đăng nhập bằng tài khoản được cấp. Tiến độ được lưu theo tài khoản này.',
      signOut: 'Đăng xuất',
      signingOut: 'Đang đăng xuất…',
      signOutFailed: 'Đăng xuất không thành công. Hãy thử lại.',
    },
  },
  notFound: {
    title: 'Không tìm thấy trang',
    body: 'Địa chỉ này không khớp với trang nào của ReflexVocab.',
    action: 'Về Hôm nay',
  },
};
