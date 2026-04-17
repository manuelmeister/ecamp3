<?php

declare(strict_types=1);

namespace App\EventListener;

use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

final readonly class RefreshTokenValidityCookieListener {
    public function __construct(private string $cookiePrefix) {}

    public function onKernelResponse(ResponseEvent $event): void {
        if (!$event->isMainRequest()) {
            return;
        }

        $response = $event->getResponse();
        $refreshTokenCookieName = "{$this->cookiePrefix}refresh_token";
        $refreshTokenValidityCookieName = "{$this->cookiePrefix}refresh_token_validity";

        foreach ($response->headers->getCookies() as $cookie) {
            if ($cookie->getName() !== $refreshTokenCookieName) {
                continue;
            }

            $expiresTime = $cookie->getExpiresTime();
            $validityValue = $expiresTime > 0 ? (string) $expiresTime : '';

            $response->headers->setCookie(
                Cookie::create($refreshTokenValidityCookieName)
                    ->withValue($validityValue)
                    ->withExpires($expiresTime)
                    ->withPath($cookie->getPath())
                    ->withDomain($cookie->getDomain() ?? '')
                    ->withSecure($cookie->isSecure())
                    ->withHttpOnly(false)
                    ->withRaw($cookie->isRaw())
                    ->withSameSite($cookie->getSameSite())
            );

            return;
        }
    }
}
