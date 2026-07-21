import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import AdminRoute from "../components/AdminRoute.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import LandingPage from "../pages/public/LandingPage.jsx";
import AboutPage from "../pages/public/AboutPage.jsx";
import PublicChapters from "../pages/public/PublicChapters.jsx";
import PublicEvents from "../pages/public/PublicEvents.jsx";
import GalleryPage from "../pages/public/GalleryPage.jsx";
import Login from "../pages/auth/Login.jsx";
import JoinRequestPage from "../pages/public/JoinRequestPage.jsx";
import Profile from "../pages/auth/Profile.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import PublicDashboard from "../pages/dashboard/PublicDashboard.jsx";
import BusinessProfile from "../pages/business/BusinessProfile.jsx";
import BusinessDirectory from "../pages/business/BusinessDirectory.jsx";
import BusinessDetails from "../pages/business/BusinessDetails.jsx";
import MyNetwork from "../pages/connections/MyNetwork.jsx";
import ReferralsReceived from "../pages/referrals/ReferralsReceived.jsx";
import ReferralsGiven from "../pages/referrals/ReferralsGiven.jsx";
import GiveReferral from "../pages/referrals/GiveReferral.jsx";
import UserChapters from "../pages/chapters/UserChapters.jsx";
import UserEvents from "../pages/events/UserEvents.jsx";
import BusinessOpportunities from "../pages/opportunities/BusinessOpportunities.jsx";
import CreateOpportunity from "../pages/opportunities/CreateOpportunity.jsx";
import Meetups from "../pages/meetups/Meetups.jsx";
import MeetupDetails from "../pages/meetups/MeetupDetails.jsx";
import MyMeetings from "../pages/meetings/MyMeetings.jsx";
import CommunityFeed from "../pages/community/CommunityFeed.jsx";
import Notifications from "../pages/notifications/Notifications.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import ManageUsers from "../pages/admin/ManageUsers.jsx";
import CreateUser from "../pages/admin/CreateUser.jsx";
import ManageChapters from "../pages/admin/ManageChapters.jsx";
import ManageEvents from "../pages/admin/ManageEvents.jsx";
import AdminReferrals from "../pages/admin/AdminReferrals.jsx";
import ManageBusinesses from "../pages/admin/ManageBusinesses.jsx";
import ManageMeetups from "../pages/admin/ManageMeetups.jsx";
import EditMeetup from "../pages/admin/EditMeetup.jsx";
import ReferralAnalytics from "../pages/admin/ReferralAnalytics.jsx";
import ManageMonthlyMeetings from "../pages/admin/ManageMonthlyMeetings.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/chapters" element={<PublicChapters />} />
      <Route path="/chapter" element={<PublicChapters />} />
      <Route path="/events" element={<PublicEvents />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/join" element={<JoinRequestPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/public-dashboard" element={<PublicDashboard />} />
          <Route path="/business/profile" element={<BusinessProfile />} />
          <Route path="/business/directory" element={<BusinessDirectory />} />
          <Route path="/businesses" element={<BusinessDirectory />} />
          <Route path="/business/:id" element={<BusinessDetails />} />
          <Route path="/businesses/:id" element={<BusinessDetails />} />
          <Route path="/connections" element={<MyNetwork />} />
          <Route path="/network" element={<MyNetwork />} />
          <Route path="/referrals/received" element={<ReferralsReceived />} />
          <Route path="/referrals/given" element={<ReferralsGiven />} />
          <Route path="/give-referral" element={<GiveReferral />} />
          <Route path="/referrals/create" element={<GiveReferral />} />
          <Route path="/user/chapters" element={<UserChapters />} />
          <Route path="/user/events" element={<UserEvents />} />
          <Route path="/opportunities" element={<BusinessOpportunities />} />
          <Route path="/opportunities/create" element={<CreateOpportunity />} />
          <Route path="/meetups" element={<Meetups />} />
          <Route path="/meetups/:id" element={<MeetupDetails />} />
          <Route path="/meetings" element={<MyMeetings />} />
          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route element={<AdminRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/users/create" element={<CreateUser />} />
          <Route path="/admin/chapters" element={<ManageChapters />} />
          <Route path="/admin/events" element={<ManageEvents />} />
          <Route path="/admin/businesses" element={<ManageBusinesses />} />
          <Route path="/admin/meetups" element={<ManageMeetups />} />
          <Route path="/admin/meetups/:id" element={<EditMeetup />} />
          <Route path="/admin/referrals" element={<AdminReferrals />} />
          <Route path="/admin/revenue-analytics" element={<ReferralAnalytics />} />
          <Route path="/admin/analytics" element={<ReferralAnalytics />} />
          <Route path="/admin/monthly-meetings" element={<ManageMonthlyMeetings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
