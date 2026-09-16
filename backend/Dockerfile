FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything into /app (matching WORKDIR)
COPY . /app/

# Bring back collectstatic so your static assets are ready for production
RUN python manage.py collectstatic --noinput

EXPOSE 8080

CMD python manage.py migrate --noinput && daphne -b 0.0.0.0 -p 8080 config.asgi:application