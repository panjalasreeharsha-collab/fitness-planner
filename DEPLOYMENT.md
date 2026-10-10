# Render deployment

The Docker image builds the Vite frontend and packages it into the Spring Boot
application, so the UI and API use one Render web service and one origin.
MySQL must be reachable over the public internet; the MySQL server on a local
computer cannot be used by Render.

## 1. Create the Railway MySQL database

Create a MySQL service in Railway and enable its public TCP proxy. Use the
public host and port for connections from Render; Railway's private host is
only reachable from Railway services. Keep the username and password private.

## 2. Create the Render service

In Render, create a Blueprint from this repository and select `render.yaml`.
When prompted, set these values from Railway's MySQL service:

- `DB_URL`: `jdbc:mysql://<PUBLIC_HOST>:<PUBLIC_PORT>/<DATABASE>?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC`
- `DB_USERNAME`: the Railway MySQL username
- `DB_PASSWORD`: the Railway MySQL password

Do not commit these values. Render generates `JWT_SECRET` for the service.
The application reads Render's `PORT` automatically.

## 3. Verify deployment

Wait for the Docker build and deployment to complete, then open the Render
service URL. The root page should show the Fitness Planner sign-in/register
screen. Check Render logs for a successful Hikari connection to MySQL if the
service fails to become healthy.

The Render web service and Railway MySQL database may incur charges according
to the plans selected on those platforms.
