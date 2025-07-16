# Use the official PHP image with Apache
FROM php:8.2-apache

RUN apt-get update && apt-get install -y wget

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libpq-dev \
    git \
    unzip \
    && docker-php-ext-install intl pdo pdo_mysql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install Symfony CLI
RUN wget https://get.symfony.com/cli/installer -O - | bash && \
    mv /root/.symfony5/bin/symfony /usr/local/bin/symfony
    
# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy app files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html/var

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
