export const mockUserSeenContent = [
  {
    user_id: 'd8a7f3e2-1234-5678-9abc-def012345678',
    content_id: 'content-1',
    game_type: 'who_among_us',
    seen_count: 12,
    last_seen: '2024-01-15T14:30:00Z',
    content: {
      id: 'content-1',
      content_text_en: 'Who is most likely to win a marathon?',
      content_text_ar: 'من هو الأكثر احتمالاً للفوز في الماراثون؟',
      difficulty_level: 1,
      is_active: true
    }
  },
  {
    user_id: 'd8a7f3e2-1234-5678-9abc-def012345678',
    content_id: 'content-2',
    game_type: 'agree_disagree',
    seen_count: 8,
    last_seen: '2024-01-15T13:20:00Z',
    content: {
      id: 'content-2',
      content_text_en: 'Pineapple belongs on pizza',
      content_text_ar: 'الأناناس ينتمي إلى البيتزا',
      difficulty_level: 2,
      is_active: true
    }
  },
  {
    user_id: 'd8a7f3e2-1234-5678-9abc-def012345678',
    content_id: 'content-3',
    game_type: 'guess_the_person',
    seen_count: 6,
    last_seen: '2024-01-15T12:10:00Z',
    content: {
      id: 'content-3',
      content_text_en: 'This person always arrives late to meetings',
      content_text_ar: 'هذا الشخص يصل دائمًا متأخرًا إلى الاجتماعات',
      difficulty_level: 1,
      is_active: true
    }
  },
  {
    user_id: 'e9b8f4d3-2345-6789-abcd-ef0123456789',
    content_id: 'content-1',
    game_type: 'who_among_us',
    seen_count: 5,
    last_seen: '2024-01-15T11:00:00Z',
    content: {
      id: 'content-1',
      content_text_en: 'Who is most likely to win a marathon?',
      content_text_ar: 'من هو الأكثر احتمالاً للفوز في الماراثون؟',
      difficulty_level: 1,
      is_active: true
    }
  },
  {
    user_id: 'e9b8f4d3-2345-6789-abcd-ef0123456789',
    content_id: 'content-4',
    game_type: 'who_among_us',
    seen_count: 3,
    last_seen: '2024-01-15T10:30:00Z',
    content: {
      id: 'content-4',
      content_text_en: 'Who would survive longest on a desert island?',
      content_text_ar: 'من سيبقى على قيد الحياة لأطول فترة في جزيرة صحراوية؟',
      difficulty_level: 3,
      is_active: true
    }
  }
];

export const mockContentExposureStats = {
  totalUsers: 8,
  totalContentViewed: 45,
  avgSeenPerUser: 6,
  overexposedContent: 12
};