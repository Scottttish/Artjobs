
export const supabase = {
  auth: {
    getSession: async () => ({
      data: {
        session: {
          user: {
            id: 'mock-user-id'
          }
        }
      },
      error: null
    })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({
          data: {
            full_name: 'ФФФФ',
            email: 'arr@gmail.com'
          },
          error: null
        })
      })
    })
  })
};
