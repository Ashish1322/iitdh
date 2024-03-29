import React, { useState, useContext } from "react";
import LoginImage from "../assets/login.png";
import { Link } from "react-router-dom";

import { HisContext } from "../HisContext";

export default function Login() {
  const { login, loading } = useContext(HisContext);

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  return (
    <section className="d-flex align-items-center" style={{ height: "70vh" }}>
      <div className="container-fluid h-custom">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-md-9 col-lg-6 col-xl-5">
            <img src={LoginImage} className="img-fluid" alt="Sample image" />
          </div>
          <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
            <form>
              <h3 className="mb-3  me-3" style={{ fontFamily: "sans-serif" }}>
                Login Now !
              </h3>

              {/* Email input */}
              <div className="form-outline mb-4">
                <input
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  type="email"
                  id="form3Example3"
                  className="form-control form-control-lg"
                  placeholder="Enter your email address"
                />
                <label className="form-label" htmlFor="form3Example3"></label>
              </div>

              <div className="form-outline mb-3">
                <input
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  type="password"
                  id="form3Example4"
                  className="form-control form-control-lg"
                  placeholder="Enter password"
                />
                <label className="form-label" htmlFor="form3Example4"></label>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                {/* Checkbox */}

                <div className="text-center text-lg-start mt-4 pt-2">
                  {loading ? (
                    <button
                      disabled
                      type="button"
                      className="btn btn-primary btn-lg"
                      style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    >
                      Please Wait ....
                    </button>
                  ) : (
                    <button
                      onClick={() => login(email, password)}
                      type="button"
                      className="btn btn-primary btn-lg"
                      style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    >
                      Login
                    </button>
                  )}

                  <p className="small fw-bold mt-2 pt-1 mb-0">
                    Don't have an account?{" "}
                    <Link to="/signup" className="link-danger">
                      Register
                    </Link>
                  </p>
                </div>
                <a className="text-body">Forgot password?</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
