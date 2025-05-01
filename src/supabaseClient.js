export const supabase = {
  auth: {
    getSession: async () => ({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null
    })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({
          data: {
            full_name: 'Айжан',
            email: 'aizhan@example.com'
          },
          error: null
        })
      })
    })
  })
};
