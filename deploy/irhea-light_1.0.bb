SUMMARY = "iRHEA-Light Web UI - Premium coffee machine touchscreen interface"
DESCRIPTION = "Static EJS-built web UI for iRHEA-Light coffee machine, served by Apache2"
HOMEPAGE = "https://github.com/hongmuk/irhea-light-demo"
LICENSE = "CLOSED"

DEPENDS = ""
RDEPENDS_${PN} = "apache2"

# Source files: built static site (docs/) + apache2 vhost config
SRC_URI = "file://docs \
           file://apache2-irhea-light.conf \
          "

S = "${WORKDIR}"

# Static files only — no compilation
do_compile[noexec] = "1"

do_install() {
    # Install web application files at apache document root
    install -d ${D}${localstatedir}/www/html
    cp -r ${WORKDIR}/docs/* ${D}${localstatedir}/www/html/

    # Set web file permissions
    find ${D}${localstatedir}/www/html -type d -exec chmod 755 {} \;
    find ${D}${localstatedir}/www/html -type f -exec chmod 644 {} \;

    # Install Apache vhost
    install -d ${D}${sysconfdir}/apache2/sites-available
    install -m 0644 ${WORKDIR}/apache2-irhea-light.conf \
        ${D}${sysconfdir}/apache2/sites-available/irhea-light.conf
}

# On-target post-install: enable modules + site, ENABLE apache2 at boot, reload
pkg_postinst_${PN}() {
    #!/bin/sh
    if [ -z "$D" ]; then
        echo "Configuring Apache for iRHEA-Light UI..."

        a2enmod rewrite 2>/dev/null || true
        a2enmod deflate 2>/dev/null || true
        a2enmod expires 2>/dev/null || true
        a2enmod headers 2>/dev/null || true

        # Disable default site to avoid conflict on port 80
        a2dissite 000-default 2>/dev/null || true
        a2ensite irhea-light 2>/dev/null || true

        # Ensure Apache starts on boot
        systemctl enable apache2 2>/dev/null || true

        # Start now if not already running, otherwise reload
        if systemctl is-active apache2 >/dev/null 2>&1; then
            systemctl reload apache2 || true
        else
            systemctl start apache2 2>/dev/null || /etc/init.d/apache2 start 2>/dev/null || true
        fi

        echo "iRHEA-Light UI installed. Access at: http://<board-ip>/"
    else
        echo "iRHEA-Light UI will be configured on first boot"
    fi
}

pkg_prerm_${PN}() {
    #!/bin/sh
    if [ -z "$D" ]; then
        echo "Removing iRHEA-Light UI..."
        a2dissite irhea-light 2>/dev/null || true
        a2ensite 000-default 2>/dev/null || true

        if systemctl is-active apache2 >/dev/null 2>&1; then
            systemctl reload apache2 || true
        elif [ -x /etc/init.d/apache2 ]; then
            /etc/init.d/apache2 reload || true
        fi
    fi
}

FILES_${PN} += " \
    ${localstatedir}/www/html/* \
    ${sysconfdir}/apache2/sites-available/irhea-light.conf \
"

INSANE_SKIP_${PN} += "ldflags"
INSANE_SKIP_${PN} += "already-stripped"
