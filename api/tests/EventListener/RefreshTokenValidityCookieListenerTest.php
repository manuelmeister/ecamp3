<?php

namespace App\Tests\EventListener;

use App\EventListener\RefreshTokenValidityCookieListener;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * @internal
 */
class RefreshTokenValidityCookieListenerTest extends TestCase {
    public function testAddsValidityCookieForRefreshTokenCookie(): void {
        $listener = new RefreshTokenValidityCookieListener('example_com_');

        $refreshCookieExpiry = time() + 3600;
        $response = new Response();
        $response->headers->setCookie(
            Cookie::create('example_com_refresh_token')
                ->withValue('refresh-token-value')
                ->withPath('/')
                ->withExpires($refreshCookieExpiry)
                ->withSecure(true)
                ->withHttpOnly(true)
                ->withSameSite(Cookie::SAMESITE_STRICT)
        );

        $event = new ResponseEvent(
            $this->createStub(HttpKernelInterface::class),
            new Request(),
            HttpKernelInterface::MAIN_REQUEST,
            $response
        );

        $listener->onKernelResponse($event);

        $cookies = $response->headers->getCookies();
        $refreshTokenValidityCookie = array_values(array_filter(
            $cookies,
            fn (Cookie $cookie) => 'example_com_refresh_token_validity' === $cookie->getName()
        ))[0];

        $this->assertSame((string) $refreshCookieExpiry, $refreshTokenValidityCookie->getValue());
        $this->assertSame($refreshCookieExpiry, $refreshTokenValidityCookie->getExpiresTime());
        $this->assertFalse($refreshTokenValidityCookie->isHttpOnly());
        $this->assertTrue($refreshTokenValidityCookie->isSecure());
        $this->assertSame('strict', $refreshTokenValidityCookie->getSameSite());
    }

    public function testDoesNothingWhenNoRefreshTokenCookieIsSet(): void {
        $listener = new RefreshTokenValidityCookieListener('example_com_');
        $response = new Response();
        $event = new ResponseEvent(
            $this->createStub(HttpKernelInterface::class),
            new Request(),
            HttpKernelInterface::MAIN_REQUEST,
            $response
        );

        $listener->onKernelResponse($event);

        $this->assertCount(0, $response->headers->getCookies());
    }
}
