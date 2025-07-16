# Use the official PHP image with Apache
FROM php:8.2-apache

# Set Apache DocumentRoot to /var/www/html/public
RUN sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/apache2.conf /etc/apache2/sites-available/000-default.conf

RUN apt-get update && apt-get install -y wget

# Install system dependencies and PHP extensions (including PostgreSQL)
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libpq-dev \
    git \
    unzip \
    && docker-php-ext-install intl pdo pdo_pgsql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install Symfony CLI
RUN wget https://get.symfony.com/cli/installer -O - | bash && \
    mv /root/.symfony5/bin/symfony /usr/local/bin/symfony

# Set environment variable to allow Composer plugins as root
ENV COMPOSER_ALLOW_SUPERUSER=1

# Set default envs (will be overridden by Render at runtime)
ENV APP_ENV=prod
ENV DATABASE_URL="postgres://fake:fake@127.0.0.1:5432/fake"

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy app files
COPY . .

# Install PHP dependencies (skip scripts to avoid DB errors at build)
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Ensure var directory exists
RUN mkdir -p /var/www/html/var

# Set permissions
RUN chown -R www-data:www-data /var/www/html/var

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
