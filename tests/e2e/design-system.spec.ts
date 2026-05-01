import { expect, test } from "@playwright/test";

test("design-system tokens compile into runtime CSS", async ({ page }) => {
  await page.goto("/");

  const styles = await page.evaluate(() => {
    const brandProbe = document.createElement("div");
    brandProbe.className = "text-label text-text-inverse bg-brand-primary rounded-ui-lg";
    brandProbe.textContent = "Token probe";

    const skeletonProbe = document.createElement("div");
    skeletonProbe.className = "skeleton-shimmer";

    document.body.append(brandProbe, skeletonProbe);

    const bodyStyle = getComputedStyle(document.body);
    const brandStyle = getComputedStyle(brandProbe);
    const skeletonStyle = getComputedStyle(skeletonProbe);
    const result = {
      bodyBackground: bodyStyle.backgroundColor,
      color: brandStyle.color,
      brandBackground: brandStyle.backgroundColor,
      borderRadius: brandStyle.borderRadius,
      skeletonBackground: skeletonStyle.backgroundColor,
      animationName: skeletonStyle.animationName
    };

    brandProbe.remove();
    skeletonProbe.remove();
    return result;
  });

  expect(styles.bodyBackground).toBe("rgb(247, 248, 245)");
  expect(styles.color).toBe("rgb(255, 255, 255)");
  expect(styles.brandBackground).toBe("rgb(20, 92, 55)");
  expect(styles.borderRadius).toBe("20px");
  expect(styles.skeletonBackground).toBe("rgb(228, 233, 226)");
  expect(styles.animationName).toContain("shimmer");
});
