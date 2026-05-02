FROM node:22-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM eclipse-temurin:25-jdk AS backend
WORKDIR /app
COPY backend/.mvn/ .mvn/
COPY backend/mvnw backend/pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY backend/src ./src
COPY --from=frontend /app/dist ./src/main/resources/static
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:25-jre
COPY --from=backend /app/target/*.jar /app.jar
ENTRYPOINT ["java","-jar","/app.jar"]