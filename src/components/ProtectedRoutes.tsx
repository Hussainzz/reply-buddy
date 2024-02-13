import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useRecoilState } from "recoil";
import { isLoggedInAtom } from "../recoil-store/atoms/authState";
import { getBuddyToken } from "../utils/storage";
import AppLayout from "./AppLayout";

const ProtectedRoutes = () => {
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(isLoggedInAtom);

  useEffect(() => {
    (async () => {
      const token = await getBuddyToken("token");
      console.log(token);
      setIsLoggedIn(!!token?.length);
    })();
  }, []);

  return isLoggedIn ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoutes;
