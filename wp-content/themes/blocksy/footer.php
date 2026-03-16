<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package Blocksy
 */

blocksy_after_current_template();
do_action('blocksy:content:bottom');

?>
	</main>

	<?php
		do_action('blocksy:content:after');
		do_action('blocksy:footer:before');

		blocksy_output_footer();

		do_action('blocksy:footer:after');
	?>
</div>

<?php wp_footer(); ?>
<!-- Vendorama Cookie Banner -->
<style>
#vendorama-cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #F5A623;
    color: #1a1a1a;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    z-index: 99999;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
    flex-wrap: wrap;
	border-top: 5px solid #1A6B3C;
}
#vendorama-cookie-banner a {
    color: #1A6B3C;
    text-decoration: underline;
}
#vendorama-cookie-banner button {
    background: #1A6B3C;
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
}
#vendorama-cookie-banner button:hover {
    background: #145231;
}
</style>

<div id="vendorama-cookie-banner">
    <span>
        🍪 Diese Website verwendet ausschließlich technisch notwendige Cookies. 
        Mehr Infos in unserer <a href="/datenschutz">Datenschutzerklärung</a>.
    </span>
    <button onclick="vendoramaCookieOk()">Verstanden</button>
</div>

<script>
if (localStorage.getItem('vendorama_cookie_ok')) {
    document.getElementById('vendorama-cookie-banner').style.display = 'none';
}

function vendoramaCookieOk() {
    localStorage.setItem('vendorama_cookie_ok', '1');
    document.getElementById('vendorama-cookie-banner').style.display = 'none';
}
</script>
</body>
</html>
