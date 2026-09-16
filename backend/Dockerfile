# Use an official lightweight Python image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your project code
COPY . .

RUN python manage.py collectstatic --noinput
# Expose the port Back4App expects
EXPOSE 8080

# The command to start your ASGI server (Daphne)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8080", "config.asgi:application"]