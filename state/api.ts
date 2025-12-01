import { cleanParams, createNewUserInDatabase, withToast } from "@/lib/utils";
import {
  BuyersResponse,
  FiltersState,
  Property,
  SellersResponse,
  UsersResponse,
  UserStatsResponse,
  Village,
  VillagesResponse,
  VillageStatsResponse,
} from "@/types/index.t";
import { GetSellerPropertiesResponse } from "@/types/seller.t";
import { createClient } from "@/utils/supabase/client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Types for admin endpoints
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "SELLER" | "BUYER" | "ADMIN" | "MODERATOR";
  phone?: string;
  createdAt: string;
  updatedAt: string;
  matrixUserId?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isSellerVerified: boolean;
  avatarUrl?: string;
  exposesCount: number;
}

export interface Seller {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isSellerVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  matrixUserId?: string;
  propertyStats: {
    total: number;
    inReview: number;
    published: number;
    sold: number;
    rejected: number;
  };
  recentProperties: any[];
}

export interface Buyer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  matrixUserId?: string;
}

const supabase = createClient();

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3005",
    // baseUrl: "http://localhost:3005",
    prepareHeaders: async (headers) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const idToken = session?.access_token;

      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
      }

      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Properties", "Users", "Sellers", "Buyers", "Villages"],
  endpoints: (build) => ({
    getAuthUser: build.query<any, void>({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        console.log(process.env.NEXT_PUBLIC_API_BASE_URL);

        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          const { data: supabaseUserData } = await supabase
            .from("user")
            .select("*")
            .eq("id", session?.user.id)
            .single();
          console.log("supabaseUserData:", supabaseUserData);

          const idToken = session?.access_token;
          const user = session?.user;
          const userRole = user?.user_metadata.role;
          console.log("session:", session);

          const endpoint =
            userRole === "BUYER"
              ? `/buyer/${user?.id}`
              : userRole === "SELLER"
              ? `/seller/${user?.id}`
              : "";
          console.log("endpoint:", endpoint);

          const userNewData = { ...user, ...supabaseUserData };
          console.log("userNewData:", userNewData);

          let userDetailsResponse = await fetchWithBQ(endpoint);
          console.log("user:", user);
          console.log("userDetailsResponse:", userDetailsResponse);

          if (!userDetailsResponse.data) {
            userDetailsResponse = await createNewUserInDatabase(
              userNewData,
              idToken,
              userRole,
              fetchWithBQ
            );
          }

          // Get Matrix credentials if user has a matrixUserId
          let matrixCredentials = null;
          const userData = userDetailsResponse.data as {
            matrixUserId?: string;
            matrixPassword?: string;
          };
          if (userData?.matrixUserId && userData?.matrixPassword) {
            try {
              const matrixResponse = await fetchWithBQ({
                url: "auth/matrix-token", // Remove leading slash
                method: "POST",
                body: {
                  matrixUserId: userData.matrixUserId,
                  matrixPassword: userData.matrixPassword,
                },
              });

              if (matrixResponse.data) {
                matrixCredentials = matrixResponse.data;
              }
            } catch (matrixError) {
              console.error("Failed to get Matrix credentials:", matrixError);
              // Continue without Matrix credentials
            }
          }

          return {
            data: {
              user: userDetailsResponse.data,
              userRole: userRole,
              matrix: matrixCredentials, // Include Matrix credentials in response
            },
          };
        } catch (error: any) {
          return { error: error.message || "Error fetching auth user" };
        }
      },
    }),
    // property related endpoints
    // Create property endpoint
    createProperty: build.mutation<any, any>({
      query: (propertyData) => ({
        url: "properties",
        method: "POST",
        body: propertyData,
      }),
      invalidatesTags: [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Property created successfully!",
          error: "Failed to create property.",
        });
      },
    }),
    updateProperty: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `properties/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Properties", id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Property updated successfully!",
          error: "Failed to update property.",
        });
      },
    }),
    getProperties: build.query<
      Property[],
      Partial<FiltersState & { favoriteIds?: number[] }>
    >({
      query: (filters) => {
        const params = cleanParams({
          Location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          bedrooms: filters.beds,
          bathrooms: filters.baths,
          propertyType: filters.propertyType,
          livingAreaMin: filters.squareFeet?.[0],
          livingAreaMax: filters.squareFeet?.[1],
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });

        console.log(params);

        return { url: "properties", params };
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Properties" as const, id }))]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch properties.",
        });
      },
    }),
    getProperty: build.query<Property, string>({
      query: (id) => `properties/${id}`,
      providesTags: (result, error, id) => [
        { type: "Properties", id: result?.id },
      ],
    }),
    getSellerProperties: build.query<GetSellerPropertiesResponse, string>({
      query: (sellerId) => `seller/${sellerId}/properties`,
      providesTags: (result, error, sellerId) => [
        { type: "Properties", id: sellerId },
      ],
    }),
    getPropertyTypes: build.query<any, void>({
      query: () => `property-type/stats`,
      providesTags: (result) => [{ type: "Properties", id: "PROPERTY_TYPES" }],
    }),

    // Admin User Management Endpoints
    getAllUsers: build.query<
      UsersResponse,
      {
        page?: number;
        limit?: number;
        role?: string;
        status?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
      }
    >({
      query: (params) => ({
        url: "admin/users",
        params: cleanParams(params),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ id }) => ({ type: "Users" as const, id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getAllSellers: build.query<
      SellersResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
      }
    >({
      query: (params) => ({
        url: "admin/sellers",
        params: cleanParams(params),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.sellers.map(({ id }) => ({
                type: "Sellers" as const,
                id,
              })),
              { type: "Sellers", id: "LIST" },
            ]
          : [{ type: "Sellers", id: "LIST" }],
    }),

    getAllBuyers: build.query<
      BuyersResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
      }
    >({
      query: (params) => ({
        url: "admin/buyers",
        params: cleanParams(params),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.buyers.map(({ id }) => ({
                type: "Buyers" as const,
                id,
              })),
              { type: "Buyers", id: "LIST" },
            ]
          : [{ type: "Buyers", id: "LIST" }],
    }),

    getUserById: build.query<any, string>({
      query: (id) => `admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    updateUserStatus: build.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `admin/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "User status updated successfully!",
          error: "Failed to update user status.",
        });
      },
    }),

    deleteUser: build.mutation<any, { id: string; soft?: boolean }>({
      query: ({ id, soft = true }) => ({
        url: `admin/users/${id}`,
        method: "DELETE",
        params: { soft },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
        { type: "Sellers", id: "LIST" },
        { type: "Buyers", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "User deleted successfully!",
          error: "Failed to delete user.",
        });
      },
    }),

    getUserStats: build.query<UserStatsResponse, void>({
      query: () => "admin/users/stats",
      providesTags: [{ type: "Users", id: "STATS" }],
    }),

    // Village Admin Endpoints
    getAllVillages: build.query<
      VillagesResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        county?: string;
        status?: string;
        sortBy?: string;
        sortOrder?: string;
      }
    >({
      query: (params) => ({
        url: "admin/villages",
        params: cleanParams(params),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.villages.map(({ id }) => ({
                type: "Villages" as const,
                id,
              })),
              { type: "Villages", id: "LIST" },
            ]
          : [{ type: "Villages", id: "LIST" }],
    }),

    getVillageById: build.query<Village, string>({
      query: (id) => `admin/villages/${id}`,
      providesTags: (result, error, id) => [{ type: "Villages", id }],
    }),
    createVillage: build.mutation<any, any>({
      query: (villageData) => ({
        url: "admin/villages",
        method: "POST",
        body: villageData,
      }),
      invalidatesTags: [{ type: "Villages", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Village created successfully!",
          error: "Failed to create village.",
        });
      },
    }),
    updateVillage: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `admin/villages/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Villages", id },
        { type: "Villages", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Village updated successfully!",
          error: "Failed to update village.",
        });
      },
    }),
    updateVillageStatus: build.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `admin/villages/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Villages", id },
        { type: "Villages", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Village status updated successfully!",
          error: "Failed to update village status.",
        });
      },
    }),
    deleteVillage: build.mutation<any, string>({
      query: (id) => ({
        url: `admin/villages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Villages", id },
        { type: "Villages", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Village deleted successfully!",
          error: "Failed to delete village.",
        });
      },
    }),
    getVillageStats: build.query<VillageStatsResponse, void>({
      query: () => "admin/villages/stats",
      providesTags: [{ type: "Villages", id: "STATS" }],
    }),

    getCounties: build.query<{ counties: string[] }, void>({
      query: () => "admin/villages/counties",
      providesTags: [{ type: "Villages", id: "COUNTIES" }],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetAuthUserQuery,
  useCreatePropertyMutation,
  useGetPropertyQuery,
  useGetSellerPropertiesQuery,
  useGetPropertyTypesQuery,
  useUpdatePropertyMutation,
  useGetAllUsersQuery,
  useGetAllSellersQuery,
  useGetAllBuyersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,
  useGetAllVillagesQuery,
  useGetVillageByIdQuery,
  useCreateVillageMutation,
  useUpdateVillageMutation,
  useUpdateVillageStatusMutation,
  useDeleteVillageMutation,
  useGetVillageStatsQuery,
  useGetCountiesQuery,

} = api;
